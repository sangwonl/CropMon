/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { BrowserWindow } from 'electron';

import { AssetResolverFunc } from '@presenters/common/asset';
import { emptyBounds } from '@utils/bounds';
import { isMac } from '@utils/process';

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
      focusable: isMac(),
      skipTaskbar: true,
      transparent: true,
      titleBarStyle: 'customButtonsOnHover', // for MacOS, with frame: false
      enableLargerThanScreen: true, // for MacOS, margin 5px workaround
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    });

    window.setBounds(emptyBounds());
    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    window.setAlwaysOnTop(true, 'main-menu', 1);

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
