/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { BrowserWindow } from 'electron';
import localShortcut from 'electron-localshortcut';

import store from '@presenters/redux/store';
import { closePreferences } from '@presenters/redux/ui/slice';

type AssetResolverFunc = (path: string) => string;

export class OverlaysBuilder {
  assetResolver: AssetResolverFunc;

  constructor(assetResolver: AssetResolverFunc) {
    this.assetResolver = assetResolver;
  }

  // eslint-disable-next-line class-methods-use-this
  build(): BrowserWindow {
    const window = new BrowserWindow({
      show: true,
      frame: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      width: 640,
      height: 480,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
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

    window.on('close', (event) => {
      event.preventDefault();
      store.dispatch(closePreferences());
    });

    localShortcut.register(window, 'Escape', () => {
      store.dispatch(closePreferences());
    });

    return window;
  }
}
