/* eslint-disable no-plusplus */
/* eslint-disable new-cap */
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
import { app, shell, dialog, nativeImage } from 'electron';

import { TYPES } from '@di/types';
import { IBounds } from '@core/entities/screen';
import { IPreferences } from '@core/entities/preferences';
import { IUiDirector } from '@core/interfaces/director';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { assetPathResolver } from '@utils/asset';
import { CachedWidget } from '@ui/widgets/cached';
import { AppTray } from '@ui/widgets/tray';
import { CaptureOverlay } from '@ui/widgets/overlays';
import { PreferencesModal } from '@ui/widgets/preferences';
import { ProgressDialog } from '@ui/widgets/progressdialog';
import { StaticPagePopup } from '@ui/widgets/staticpage';
import { StaticPagePopupOptions } from '@ui/widgets/staticpage/shared';
import { getOverlayScreenBounds, SPARE_PIXELS } from '@utils/bounds';
import { iconizeShortcut } from '@utils/shortcut';
import { isMac } from '@utils/process';

import { version as curVersion } from '../package.json';

class CaptureOverlayWrap {
  private widget?: CaptureOverlay;

  constructor() {
    this.widget = new CaptureOverlay();
  }

  show(screenBounds: IBounds) {
    const sparedBounds = this.addSparePixels(screenBounds);
    this.widget?.setIgnoreMouseEvents(false);
    this.widget?.show();
    // WORKAROUND: https://github.com/electron/electron/issues/10862
    for (let i = 0; i < 5; i++) {
      this.widget?.setBounds(sparedBounds);
    }
  }

  hide() {
    // should wait for react component rerender
    setTimeout(() => {
      this.widget?.hide();
    }, 300);
  }

  close() {
    this.widget?.close();
  }

  ignoreMouseEvents() {
    this.widget?.setIgnoreMouseEvents(true);
    this.widget?.blur();
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

class CachedStaticPagePopup extends CachedWidget<
  StaticPagePopup,
  StaticPagePopupOptions,
  void
> {}

class CachedPreferencesModal extends CachedWidget<
  PreferencesModal,
  IPreferences,
  IPreferences
> {}

@injectable()
export class UiDirector implements IUiDirector {
  private appTray: AppTray | undefined;
  private captureOverlay: CaptureOverlayWrap | undefined;
  private updateProgressDialog: ProgressDialog | undefined;
  private preferencesModal: CachedPreferencesModal | undefined;
  private aboutPopup: CachedStaticPagePopup | undefined;
  private aboutContent: string | undefined;
  private relNotePopup: CachedStaticPagePopup | undefined;
  private relNoteContent: string | undefined;
  private helpPopup: CachedStaticPagePopup | undefined;
  private helpContent: string | undefined;

  constructor(
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker
  ) {}

  initialize(): void {
    this.appTray = isMac() ? AppTray.forMac() : AppTray.forWindows();
    this.captureOverlay = new CaptureOverlayWrap();
    this.preferencesModal = new CachedPreferencesModal(PreferencesModal, 30);
    this.aboutPopup = new CachedStaticPagePopup(StaticPagePopup, 30);
    this.relNotePopup = new CachedStaticPagePopup(StaticPagePopup, 30);
    this.helpPopup = new CachedStaticPagePopup(StaticPagePopup, 30);
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
    this.captureOverlay?.close();

    if (relaunch) {
      app.relaunch();
    }
    app.quit();
    this.tracker.event('app-lifecycle', 'quit');
  }

  async openAboutPagePopup(prefs: IPreferences): Promise<void> {
    if (this.aboutContent === undefined) {
      const aboutHtmlPath = assetPathResolver('docs/about.html');
      this.aboutContent = (await fs.promises.readFile(aboutHtmlPath, 'utf-8'))
        .replace('__shortcut__', iconizeShortcut(prefs.shortcut))
        .replace('__version__', curVersion);
    }

    this.aboutPopup?.open({
      width: 300,
      height: 220,
      html: this.aboutContent,
    });
  }

  async openReleaseNotesPopup(): Promise<void> {
    if (this.relNoteContent === undefined) {
      const relNotePath = assetPathResolver('docs/relnote.md');
      this.relNoteContent = await fs.promises.readFile(relNotePath, 'utf-8');
    }

    this.relNotePopup?.open({
      width: 440,
      height: 480,
      markdown: this.relNoteContent,
    });
  }

  async openHelpPagePopup(): Promise<void> {
    if (this.helpContent === undefined) {
      const helpHtmlPath = assetPathResolver('docs/help.html');
      this.helpContent = (
        await fs.promises.readFile(helpHtmlPath, 'utf-8')
      ).replace('__assets__', assetPathResolver(''));
    }

    this.helpPopup?.open({
      width: 600,
      height: 800,
      html: this.helpContent,
    });
  }

  async openPreferencesModal(
    prefs: IPreferences
  ): Promise<IPreferences | undefined> {
    const updatedPrefs = await this.preferencesModal?.openAsModal(prefs);
    this.tracker.view('preferences-modal');

    return updatedPrefs;
  }

  enableCaptureSelectionMode(): IBounds {
    const screenBounds = getOverlayScreenBounds();
    this.captureOverlay?.show(screenBounds);
    this.tracker.view('capture-area-selection');
    return screenBounds;
  }

  disableCaptureSelectionMode(): void {
    this.captureOverlay?.hide();
    this.tracker.view('idle');
  }

  enableRecordingMode(): void {
    this.captureOverlay?.ignoreMouseEvents();
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
}
