/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { app, shell, dialog, BrowserWindow, screen } from 'electron';
import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import { IBounds, IScreenInfo } from '@core/entities/screen';
import { IAnalyticsTracker } from '@core/components/tracker';
import { assetResolver } from '@presenters/common/asset';
import { AppTray } from '@presenters/ui/tray';
import { OverlaysWindow } from '@presenters/ui/overlays';
import { PreferencesWindow } from '@presenters/ui/preferences';
import { setCustomData } from '@utils/remote';
import { SPARE_PIXELS } from '@utils/bounds';
import { isMac } from '@utils/process';
import { ProgressBar } from '@presenters/ui/stateless/progress';

class OverlaysWinPool {
  private windows?: Map<number, OverlaysWindow>;

  constructor(screenInfos: Array<IScreenInfo>) {
    this.windows = new Map<number, OverlaysWindow>();

    // pre-create overlays windows for pool
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
    this.windows?.forEach((w) => {
      w.setIgnoreMouseEvents(true);
      setTimeout(() => {
        w.hide();
      }, 300);
    });
  }

  ignoreMouseEvents() {
    this.windows?.forEach((w) => {
      w.setIgnoreMouseEvents(true);
    });
  }

  toggleDevTools() {
    this.windows?.forEach((w) => {
      const isOpened = w.webContents.isDevToolsOpened();
      w.webContents.toggleDevTools();
      w.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: isOpened,
      });
    });
  }

  private getOrBuild(screenId: number): BrowserWindow {
    let window = this.windows?.get(screenId);
    if (window === undefined) {
      window = new OverlaysWindow();
      setCustomData(window, 'screenId', screenId);
      this.windows?.set(screenId, window);
    }
    return window;
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
  private preferencesWindow!: BrowserWindow;
  private overlaysWindows!: OverlaysWinPool;

  constructor(
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker
  ) {}

  intialize() {
    const screenInfos = this.populateScreenInfos();

    const trayIconPath = assetResolver('icon.png');
    this.appTray = isMac()
      ? AppTray.forMac(trayIconPath)
      : AppTray.forWindows(trayIconPath);

    this.preferencesWindow = new PreferencesWindow();
    this.overlaysWindows = new OverlaysWinPool(screenInfos);

    // WORKAROUND to fix wrong position and bounds at the initial time
    this.overlaysWindows.showAll(screenInfos);
    this.overlaysWindows.hideAll();

    const pb = new ProgressBar();
  }

  toggleDevTools() {
    this.preferencesWindow.webContents.toggleDevTools();
    this.overlaysWindows.toggleDevTools();
  }

  quitApplication() {
    this.tracker.event('app-lifecycle', 'quit', () => {
      process.exit();
    });
  }

  openPreferencesWindow() {
    this.preferencesWindow.show();
    this.tracker.view('preferences-window');
  }

  closePreferencesWindow() {
    this.preferencesWindow.hide();
    this.tracker.view('idle');
  }

  async openDialogForRecordHomeDir(path?: string): Promise<string> {
    const { filePaths } = await dialog.showOpenDialog(this.preferencesWindow, {
      defaultPath: path ?? app.getPath('videos'),
      properties: ['openDirectory'],
    });

    return filePaths.length > 0 ? filePaths[0] : '';
  }

  enableCaptureSelectionMode(): Array<IScreenInfo> {
    const screenInfos = this.populateScreenInfos();
    this.overlaysWindows.showAll(screenInfos);
    this.tracker.view('capture-area-selection');
    return screenInfos;
  }

  disableCaptureSelectionMode(): void {
    this.overlaysWindows.hideAll();
    this.tracker.view('idle');
  }

  enableRecordingMode(): void {
    this.overlaysWindows.ignoreMouseEvents();
    this.tracker.view('in-recoding');
  }

  showItemInFolder(path: string): void {
    shell.showItemInFolder(path);
  }

  private populateScreenInfos(): Array<IScreenInfo> {
    return screen.getAllDisplays().map((d) => {
      return { id: d.id, bounds: d.bounds };
    });
  }
}
