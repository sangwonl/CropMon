/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { BrowserWindow, ipcMain } from 'electron';

import { assetResolver } from '@presenters/common/asset';
import { setCustomData } from '@utils/remote';

import { WindowType } from '../types';
import { ProgressDialogOptions } from './types';

export class ProgressDialog extends BrowserWindow {
  options?: ProgressDialogOptions;

  constructor(options: ProgressDialogOptions) {
    super({
      show: false,
      width: options.layout?.width || 500,
      height: options.layout?.height || 240,
      icon: assetResolver('icon.png'),
      frame: true,
      resizable: false,
      maximizable: false,
      minimizable: false,
      closable: false,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    });

    this.options = options;

    setCustomData(this, 'winType', WindowType.PROGRESS_DIALOG);
    setCustomData(this, 'options', options);
    this.loadURL(`file://${__dirname}/../progress/renderer.html`);
  }

  setProgress(percent: number) {
    this.webContents.send('set-progress', { percent });
  }

  open(): Promise<void> {
    this.show();
    return new Promise((resolve, reject) => {
      const timeout = this.options?.timeout || 300;
      setTimeout(() => reject(), timeout * 1000);
      ipcMain.on('progress-done', (_event, _data) => {
        resolve();
      });
    });
  }
}
