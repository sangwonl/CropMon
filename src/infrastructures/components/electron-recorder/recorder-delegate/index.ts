/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import path from 'path';
import { BrowserWindow } from 'electron';

export class RecorderRendererDelegate extends BrowserWindow {
  constructor() {
    super({
      show: false,
      frame: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      width: -1,
      height: -1,
      webPreferences: {
        nodeIntegration: false,
        allowRunningInsecureContent: true,
        contextIsolation: true,
        enableRemoteModule: true,
        preload: path.join(__dirname, '..', 'recorder-delegate', 'preload.js'),
      },
    });
    this.loadURL(`file://${__dirname}/../recorder-delegate/renderer.html`);
  }
}
