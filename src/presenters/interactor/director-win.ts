/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { dialog, BrowserWindow, screen } from 'electron';
import { injectable } from 'inversify';

import { ScreenBounds, ScreenInfo } from '@core/entities/screen';
import { AssetResolverFunc } from '@presenters/common/asset';
import { AppTray } from '@presenters/ui/tray';
import { OverlaysBuilder } from '@presenters/ui/overlays/builder';
import { PreferencesBuilder } from '@presenters/ui/preferences/builder';
import { AppTrayBuilder } from '@presenters/ui/tray/builder';
import { setCustomData } from '@utils/custom';

import { UiDirector } from './director';

class OverlaysWindowPool {
  private builder!: OverlaysBuilder;
  private windows!: Map<number, BrowserWindow>;

  constructor(assetResolver: AssetResolverFunc) {
    this.builder = new OverlaysBuilder(assetResolver);
    this.windows = new Map<number, BrowserWindow>();
  }

  setupWithScreenInfo(screenInfo: ScreenInfo) {
    const { id: screenId, bounds } = screenInfo;
    const w = this.getOrBuild(screenId);
    setCustomData(w, 'screenId', screenId);
    w.setPosition(bounds.x, bounds.y);
    w.setBounds(bounds);
  }

  showAll() {
    this.windows.forEach((w) => w.show());
  }

  resetAll() {
    this.windows.forEach((w) => w.hide());
  }

  private getOrBuild(screenId: number): BrowserWindow {
    let window = this.windows.get(screenId);
    if (window === undefined) {
      window = this.builder.build();
      this.windows.set(screenId, window);
    }
    return window;
  }
}

@injectable()
export class UiDirectorWindows implements UiDirector {
  private assetResolver!: AssetResolverFunc;
  private appTray!: AppTray;
  private preferencesWindow!: BrowserWindow;
  private overlaysWindows!: OverlaysWindowPool;

  intialize(assetResolver: AssetResolverFunc) {
    this.assetResolver = assetResolver;
    this.appTray = new AppTrayBuilder(this.assetResolver).build();
    this.preferencesWindow = new PreferencesBuilder(this.assetResolver).build();
    this.overlaysWindows = new OverlaysWindowPool(this.assetResolver);
  }

  quitApplication() {
    process.exit();
  }

  openPreferencesWindow() {
    this.preferencesWindow.show();
  }

  closePreferencesWindow() {
    this.preferencesWindow.hide();
  }

  async openDialogForRecordHomeDir(): Promise<string> {
    const { filePaths } = await dialog.showOpenDialog(this.preferencesWindow, {
      properties: ['openDirectory'],
    });

    return filePaths.length > 0 ? filePaths[0] : '';
  }

  enableCaptureSelectionMode(): Array<ScreenInfo> {
    this.overlaysWindows.resetAll();

    const screenInfos = this.populateScreenInfos();

    screenInfos.forEach((s) => this.overlaysWindows.setupWithScreenInfo(s));

    this.overlaysWindows.showAll();

    return screenInfos;
  }

  private populateScreenInfos(): Array<ScreenInfo> {
    return screen.getAllDisplays().map((d) => {
      const { x, y, width, height } = d.bounds;
      return new ScreenInfo(d.id, new ScreenBounds(x, y, width, height));
    });
  }
}
