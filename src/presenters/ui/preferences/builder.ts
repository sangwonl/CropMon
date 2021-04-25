/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { shell, BrowserWindow } from 'electron';

import store from '@presenters/redux/store';
import { willClosePreferences } from '@presenters/redux/ui/slice';

type AssetResolverFunc = (path: string) => string;

export class PreferencesBuilder {
  assetResolver: AssetResolverFunc;

  constructor(assetResolver: AssetResolverFunc) {
    this.assetResolver = assetResolver;
  }

  // eslint-disable-next-line class-methods-use-this
  build(): BrowserWindow {
    const window = new BrowserWindow({
      show: false,
      frame: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      width: 400,
      height: 640,
      icon: this.assetResolver('icon.png'),
      webPreferences: {
        nodeIntegration: true,
      },
    });

    window.removeMenu();

    // It is a quick solution to access index.html
    // in the same way for both dev and prod.
    // dev: current - ui/main -> ../main -> current
    // prod: current - dist -> ../main -> main
    window.loadURL(`file://${__dirname}/../preferences/index.html`);

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
      store.dispatch(willClosePreferences());
    });

    // Open urls in the user's browser
    window.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    return window;
  }
}
