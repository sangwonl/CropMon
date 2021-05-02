/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { BrowserWindow } from 'electron';

import { AssetResolverFunc } from '@presenters/common/asset';

export class OverlaysBuilder {
  assetResolver: AssetResolverFunc;

  constructor(assetResolver: AssetResolverFunc) {
    this.assetResolver = assetResolver;
  }

  // eslint-disable-next-line class-methods-use-this
  build(): BrowserWindow {
    const window = new BrowserWindow({
      show: false,
      frame: false,
      resizable: false,
      focusable: false,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    });

    window.setAlwaysOnTop(true, 'floating');

    // It is a quick solution to access index.html
    // in the same way for both dev and prod.
    // dev: current - ui/main -> ../main -> current
    // prod: current - dist -> ../main -> main
    window.loadURL(`file://${__dirname}/../overlays/index.html`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    // window.webContents.on('did-finish-load', () => {
    //   if (!window) {
    //     throw new Error('"mainWindow" is not defined');
    //   }
    //   if (process.env.START_MINIMIZED) {
    //     window.minimize();
    //   } else {
    //     window.show();
    //     window.focus();
    //   }
    // });

    return window;
  }
}
