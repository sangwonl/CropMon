/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { BrowserWindow } from 'electron';

export class RecorderDelegate extends BrowserWindow {
  constructor() {
    super({
      show: false,
      frame: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      width: 0,
      height: 0,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
        // preload: path.join(__dirname, '..', 'recorder-delegate', 'preload.js'),
      },
    });
    this.loadURL(`file://${__dirname}/../rec-delegate/index.html`);
  }
}
