/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { BrowserWindow } from 'electron';
import localShortcut from 'electron-localshortcut';

import store from '@presenters/redux/store';
import { closePreferences } from '@presenters/redux/ui/slice';
import { assetPathResolver } from '@presenters/common/asset';

export class PreferencesWindow extends BrowserWindow {
  private forceClose = false;

  constructor() {
    super({
      show: false,
      frame: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      width: 640,
      height: 250,
      icon: assetPathResolver('icon.png'),
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    });
    this.setup();
  }

  private setup() {
    this.removeMenu();

    // It is a quick solution to access index.html
    // in the same way for both dev and prod.
    // dev: current - ui/main -> ../main -> current
    // prod: current - dist -> ../main -> main
    // dev
    this.loadURL(`file://${__dirname}/../preferences/renderer.html`);

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

    this.on('close', (_event) => {
      this.forceClose = true;
      store.dispatch(closePreferences());
    });

    localShortcut.register(this, 'Escape', () => {
      store.dispatch(closePreferences());
    });
  }

  close() {
    if (!this.forceClose) {
      super.close();
    }
  }
}
