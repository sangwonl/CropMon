/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { BrowserWindow } from 'electron';

import { emptyBounds } from '@utils/bounds';
import { isMac } from '@utils/process';

export class OverlaysWindow extends BrowserWindow {
  constructor() {
    super({
      show: false,
      frame: false,
      resizable: false,
      focusable: isMac(),
      skipTaskbar: true,
      transparent: true,
      titleBarStyle: 'customButtonsOnHover', // for MacOS, with frame: false
      enableLargerThanScreen: true, // for MacOS, margin 5px workaround
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    });
    this.setup();
  }

  // eslint-disable-next-line class-methods-use-this
  private setup() {
    this.setAlwaysOnTop(true, 'main-menu', 1);
    this.setBounds(emptyBounds());
    // https://github.com/electron/electron/issues/25368
    this.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // It is a quick solution to access index.html
    // in the same way for both dev and prod.
    // dev: current - ui/main -> ../main -> current
    // prod: current - dist -> ../main -> main
    this.loadURL(`file://${__dirname}/../overlays/renderer.html`);

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
  }
}
