/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import fs from 'fs';
import { inject, injectable } from 'inversify';
import { app, shell, dialog, screen, nativeImage } from 'electron';

import { TYPES } from '@di/types';
import { IBounds, IScreenInfo } from '@core/entities/screen';
import { IPreferences } from '@core/entities/preferences';
import { IUiDirector } from '@core/interfaces/director';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { assetPathResolver } from '@utils/asset';
import { AppTray } from '@ui/widgets/tray';
import { CaptureOverlay } from '@ui/widgets/overlays';
import { PreferencesModal } from '@ui/widgets/preferences';
import { ProgressDialog } from '@ui/widgets/progressdialog';
import { StaticPagePopup } from '@ui/widgets/staticpage';
import { setCustomData } from '@utils/remote';
import { SPARE_PIXELS } from '@utils/bounds';
import { iconizeShortcut } from '@utils/shortcut';
import { isMac } from '@utils/process';

import { version as curVersion } from '../package.json';

class CaptureOverlayPool {
  private widgets?: Map<number, CaptureOverlay>;

  constructor(screenInfos: Array<IScreenInfo>) {
    this.widgets = new Map<number, CaptureOverlay>();

    // pre-create overlays pool
    screenInfos.forEach(({ id: screenId }) => {
      this.getOrBuild(screenId);
    });
  }

  showAll(screenInfos: Array<IScreenInfo>) {
    screenInfos.forEach(({ id: screenId, bounds }) => {
      const sparedBounds = this.addSparePixels(bounds);
      const w = this.getOrBuild(screenId);
      w.setIgnoreMouseEvents(false);
      w.setPosition(sparedBounds.x, sparedBounds.y);
      w.setBounds(sparedBounds);
      w.show();
    });
  }

  hideAll() {
    this.widgets?.forEach((w) => {
      // should wait for react component rerender
      setTimeout(() => {
        w.hide();
      }, 300);
    });
  }

  closeAll() {
    this.widgets?.forEach((w) => {
      w.close();
    });
  }

  ignoreMouseEvents() {
    this.widgets?.forEach((w) => {
      w.setIgnoreMouseEvents(true);
      w.blur();
    });
  }

  private getOrBuild(screenId: number): CaptureOverlay {
    let w = this.widgets?.get(screenId);
    if (w === undefined) {
      w = new CaptureOverlay();
      setCustomData(w, 'screenId', screenId);
      this.widgets?.set(screenId, w);
    }
    return w;
  }

  // WORKAROUND: to fix non-clickable area at the nearest borders
  // Same issue here: https://github.com/electron/electron/issues/21929
  private addSparePixels(bounds: IBounds): IBounds {
    return {
      x: bounds.x - SPARE_PIXELS,
      y: bounds.y - SPARE_PIXELS,
      // width: (bounds.width + SPARE_PIXELS * 2) / 2,
      width: bounds.width + SPARE_PIXELS * 2,
      height: bounds.height + SPARE_PIXELS * 2,
    };
  }
}

@injectable()
export class UiDirector implements IUiDirector {
  private appTray: AppTray | undefined;
  private captureOverlays: CaptureOverlayPool | undefined;
  private preferencesModal: PreferencesModal | undefined;
  private updateProgressDialog: ProgressDialog | undefined;
  private aboutPopup: StaticPagePopup | undefined;
  private relNotePopup: StaticPagePopup | undefined;

  constructor(
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker
  ) {}

  initialize(prefs: IPreferences): void {
    this.appTray = isMac() ? AppTray.forMac() : AppTray.forWindows();
    this.refreshTrayState(prefs, false);

    const screenInfos = this.populateScreenInfos();
    this.captureOverlays = new CaptureOverlayPool(screenInfos);

    // WORKAROUND to fix wrong position and bounds at the initial time
    this.captureOverlays.showAll(screenInfos);
    this.captureOverlays.hideAll();
  }

  async refreshTrayState(
    prefs: IPreferences,
    recording?: boolean
  ): Promise<void> {
    await this.appTray?.refreshContextMenu(
      iconizeShortcut(prefs.shortcut),
      recording
    );
  }

  quitApplication(relaunch?: boolean): void {
    this.captureOverlays?.closeAll();
    this.preferencesModal?.close();

    if (relaunch) {
      app.relaunch();
    }
    app.quit();
    this.tracker.event('app-lifecycle', 'quit');
  }

  async openAboutPopup(prefs: IPreferences): Promise<void> {
    if (this.aboutPopup !== undefined) {
      this.aboutPopup.show();
      this.aboutPopup.focus();
      return;
    }

    const aboutHtmlPath = assetPathResolver('about.html');
    const content = (await fs.promises.readFile(aboutHtmlPath, 'utf-8'))
      .replace('__shortcut__', iconizeShortcut(prefs.shortcut))
      .replace('__version__', curVersion);

    this.aboutPopup = new StaticPagePopup({
      width: 300,
      height: 220,
      html: content,
    });
    this.aboutPopup.on('close', () => {
      this.aboutPopup = undefined;
    });
    this.aboutPopup.show();
  }

  async openReleaseNotes(): Promise<void> {
    if (this.relNotePopup !== undefined) {
      this.relNotePopup.show();
      this.relNotePopup.focus();
      return;
    }

    const relNotePath = assetPathResolver('relnote.md');
    const content = await fs.promises.readFile(relNotePath, 'utf-8');
    this.relNotePopup = new StaticPagePopup({
      width: 440,
      height: 480,
      markdown: content,
    });
    this.relNotePopup.on('close', () => {
      this.relNotePopup = undefined;
    });
    this.relNotePopup.show();
  }

  async openPreferencesModal(
    prefs: IPreferences
  ): Promise<IPreferences | undefined> {
    if (this.preferencesModal === undefined) {
      this.preferencesModal = new PreferencesModal();
    }

    const updatedPrefs = await this.preferencesModal.open(prefs);
    this.tracker.view('preferences-modal');

    return updatedPrefs;
  }

  enableCaptureSelectionMode(): Array<IScreenInfo> {
    const screenInfos = this.populateScreenInfos();
    this.captureOverlays?.showAll(screenInfos);
    this.tracker.view('capture-area-selection');
    return screenInfos;
  }

  disableCaptureSelectionMode(): void {
    this.captureOverlays?.hideAll();
    this.tracker.view('idle');
  }

  enableRecordingMode(): void {
    this.captureOverlays?.ignoreMouseEvents();
    this.tracker.view('in-recording');
  }

  showItemInFolder(path: string): void {
    shell.showItemInFolder(path);
  }

  async openUpdateAvailableDialog(): Promise<number> {
    const appIcon = nativeImage.createFromPath(assetPathResolver('icon.png'));
    const { response: buttonId } = await dialog.showMessageBox({
      icon: appIcon,
      title: 'Update Available',
      message:
        'An update is available. Do you want to download and install it now?',
      defaultId: 0,
      cancelId: 1,
      buttons: ['Download and Install', 'Update Later'],
    });

    return buttonId;
  }

  async startDownloadUpdate(
    onReady: () => void,
    onCancel: () => void,
    onQuit: () => void
  ): Promise<void> {
    this.updateProgressDialog = new ProgressDialog({
      title: 'Update Download',
      message: 'Downloading a new update...',
      buttons: {
        cancelTitle: 'Cancel',
        actionTitle: 'Quit & Install',
        actionHideInProgress: true,
      },
      timeout: 300,
      width: 400,
      height: 200,
    });

    this.updateProgressDialog?.on('ready-to-show', () => {
      onReady();
    });

    const restart = await this.updateProgressDialog?.open();
    if (restart) {
      onQuit();
    } else {
      onCancel();
    }

    this.updateProgressDialog?.destroy();
    this.updateProgressDialog = undefined;
  }

  setUpdateDownloadProgress(percent: number): void {
    this.updateProgressDialog?.setProgress(percent);
  }

  private populateScreenInfos(): Array<IScreenInfo> {
    return screen.getAllDisplays().map((d) => {
      return { id: d.id, bounds: d.bounds };
    });
  }
}
