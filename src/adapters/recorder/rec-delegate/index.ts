import { BrowserWindow } from 'electron';

import { isDebugMode } from '@utils/process';

export default class RecorderDelegate extends BrowserWindow {
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
        devTools: isDebugMode(),
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        contextIsolation: false,
        backgroundThrottling: false,
        offscreen: true,
      },
    });
    this.loadURL(`file://${__dirname}/../rec-delegate/index.html`);
  }
}
