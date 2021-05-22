/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { BrowserWindow } from 'electron';

export class RecorderRendererBuilder {
  build(): BrowserWindow {
    const window = new BrowserWindow({
      show: false,
      frame: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      width: -1,
      height: -1,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    });
    window.loadURL(`file://${__dirname}/../electron-recorder/renderer.html`);

    return window;
  }
}
