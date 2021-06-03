/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { ipcMain } from 'electron';

import { WindowType } from '@presenters/ui/stateless/types';

import {
  ProgressDialogOptions,
  IPC_EVENT_ON_ACTION_BTN_CLICK,
  IPC_EVENT_SET_PROGRESS,
  IPC_EVENT_ON_CANCEL_BTN_CLICK,
} from './shared';
import { ContainerWindow } from '../../basewin';

export class ProgressDialog extends ContainerWindow {
  options?: ProgressDialogOptions;

  constructor(options: ProgressDialogOptions) {
    super(WindowType.PROGRESS_DIALOG, {
      width: options.width,
      height: options.height,
      options,
    });
    this.options = options;
  }

  setProgress(progress: number) {
    this.webContents.send(IPC_EVENT_SET_PROGRESS, { progress });
  }

  open(): Promise<boolean> {
    this.show();

    return new Promise((resolve, reject) => {
      const resolveAndClose = (result: boolean) => {
        setImmediate(() => this.hide());
        resolve(result);
      };

      const timeout = this.options?.timeout || 300;
      setTimeout(() => reject(), timeout * 1000);
      ipcMain.on(IPC_EVENT_ON_ACTION_BTN_CLICK, (_event, _data) => {
        resolveAndClose(true);
      });
      ipcMain.on(IPC_EVENT_ON_CANCEL_BTN_CLICK, (_event, _data) => {
        resolveAndClose(false);
      });
    });
  }
}
