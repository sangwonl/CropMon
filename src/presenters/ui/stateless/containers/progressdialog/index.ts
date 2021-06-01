/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { ipcMain } from 'electron';

import { WindowType } from '@presenters/ui/stateless/types';

import { ProgressDialogOptions } from './types';
import { ContainerWindow } from '../../basewin';

export class ProgressDialog extends ContainerWindow {
  options?: ProgressDialogOptions;

  constructor(options: ProgressDialogOptions) {
    super(WindowType.PROGRESS_DIALOG, { props: options });
    this.options = options;
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
