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
import log from 'electron-log';

import { TYPES } from '@di/types';
import { IBounds, IScreenInfo } from '@core/entities/screen';
import { IAnalyticsTracker } from '@core/components/tracker';
import { GlobalRegistry } from '@core/components/registry';
import { assetPathResolver } from '@presenters/common/asset';
import { AppTray } from '@presenters/ui/widgets/tray';
import { CaptureOverlay } from '@presenters/ui/widgets/overlays';
import { PreferencesModal } from '@presenters/ui/widgets/preferences';
import { ProgressDialog } from '@presenters/ui/widgets/progressdialog';
import { StaticPagePopup } from '@presenters/ui/widgets/staticpage';
import { setCustomData } from '@utils/remote';
import { SPARE_PIXELS } from '@utils/bounds';
import { iconizeShortcut, INITIAL_SHORTCUT } from '@utils/shortcut';
import { isMac } from '@utils/process';

import { version as curVersion } from '../../package.json';

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
      w.on('focus', () => {
        log.info('focused...');
      });
      w.on('blur', () => {
        log.info('blured...');
      });
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
export class UiDirector {
  private appTray!: AppTray;
  private preferencesModal?: PreferencesModal;
  private captureOverlays!: CaptureOverlayPool;
  private updateProgressDialog: ProgressDialog | undefined;

  constructor(
    private globalRegistry: GlobalRegistry,
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker
  ) {}

  intialize() {
    const trayIconPath = assetPathResolver('icon.png');
    this.appTray = isMac()
      ? AppTray.forMac(trayIconPath, this.globalRegistry)
      : AppTray.forWindows(trayIconPath, this.globalRegistry);

    const screenInfos = this.populateScreenInfos();
    this.captureOverlays = new CaptureOverlayPool(screenInfos);

    // WORKAROUND to fix wrong position and bounds at the initial time
    this.captureOverlays.showAll(screenInfos);
    this.captureOverlays.hideAll();
  }

  refreshAppTrayState() {
    this.appTray.refreshContextMenu();
  }

  quitApplication(relaunch?: boolean) {
    if (relaunch) {
      app.relaunch();
    }
    app.quit();
    this.tracker.event('app-lifecycle', 'quit');
  }

  async openAboutPopup() {
    const prefs = this.globalRegistry.getUserPreferences();
    const shortcut = prefs?.shortcut ?? INITIAL_SHORTCUT;

    const aboutHtmlPath = assetPathResolver('about.html');
    const content = (await fs.promises.readFile(aboutHtmlPath, 'utf-8'))
      .replace('__shortcut__', iconizeShortcut(shortcut))
      .replace('__version__', curVersion);

    const staticPopup = new StaticPagePopup({
      width: 300,
      height: 220,
      html: content,
    });
    staticPopup.on('ready-to-show', () => staticPopup.show());
  }

  async openReleaseNotes() {
    const relNotePath = assetPathResolver('relnote.md');
    const content = await fs.promises.readFile(relNotePath, 'utf-8');
    const notePopup = new StaticPagePopup({
      width: 440,
      height: 480,
      markdown: content,
    });
    notePopup.on('ready-to-show', () => {
      notePopup.show();
    });
  }

  openPreferencesModal() {
    this.preferencesModal = new PreferencesModal();
    this.preferencesModal.on('ready-to-show', () => {
      this.preferencesModal?.show();
      this.tracker.view('preferences-modal');
    });
  }

  closePreferencesModal() {
    this.preferencesModal?.close();
    this.tracker.view('idle');
  }

  async openDialogForRecordHomeDir(path?: string): Promise<string> {
    const { filePaths } = await dialog.showOpenDialog(this.preferencesModal!, {
      defaultPath: path ?? app.getPath('videos'),
      properties: ['openDirectory'],
    });

    return filePaths.length > 0 ? filePaths[0] : '';
  }

  enableCaptureSelectionMode(): Array<IScreenInfo> {
    const screenInfos = this.populateScreenInfos();
    this.captureOverlays.showAll(screenInfos);
    this.tracker.view('capture-area-selection');
    return screenInfos;
  }

  disableCaptureSelectionMode(): void {
    this.captureOverlays.hideAll();
    this.tracker.view('idle');
  }

  enableRecordingMode(): void {
    this.captureOverlays.ignoreMouseEvents();
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

    this.updateProgressDialog!.on('ready-to-show', () => {
      onReady();
    });

    const restart = await this.updateProgressDialog!.open();
    if (restart) {
      onQuit();
    } else {
      onCancel();
    }

    this.updateProgressDialog!.destroy();
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
