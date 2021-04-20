/* eslint-disable max-classes-per-file */
import { BrowserWindow } from 'electron';
import { AppTray } from './tray';

type AssetResolverFunc = (path: string) => string;

export default class TrayBuilder {
  assetResolver: AssetResolverFunc;

  mainWindow: BrowserWindow;

  constructor(assetResolver: AssetResolverFunc, mainWindow: BrowserWindow) {
    this.assetResolver = assetResolver;
    this.mainWindow = mainWindow;
  }

  build(): AppTray {
    const iconPath = this.assetResolver('icon.png');
    return process.platform === 'darwin'
      ? AppTray.forMac(iconPath, this.mainWindow)
      : AppTray.forWindows(iconPath, this.mainWindow);
  }
}
