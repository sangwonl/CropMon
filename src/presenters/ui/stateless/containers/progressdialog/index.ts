/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { ipcMain } from 'electron';

import { WindowType } from '@presenters/ui/stateless/types';

import {
  ProgressDialogOptions,
  IPC_EVENT_ON_BUTTON_CLICK,
  IpcEventOnButtonClick,
  IPC_EVENT_SET_PROGRESS,
} from './shared';
import { ContainerWindow } from '../../basewin';

export class ProgressDialog extends ContainerWindow {
  options?: ProgressDialogOptions;

  constructor(options: ProgressDialogOptions) {
    super(WindowType.PROGRESS_DIALOG, { options });
    this.options = options;
  }

  setProgress(progress: number) {
    this.webContents.send(IPC_EVENT_SET_PROGRESS, { progress });
  }

  open(): Promise<void> {
    this.show();
    return new Promise((resolve, reject) => {
      const timeout = this.options?.timeout || 300;
      setTimeout(() => reject(), timeout * 1000);
      ipcMain.on(
        IPC_EVENT_ON_BUTTON_CLICK,
        (_event, _data: IpcEventOnButtonClick) => {
          resolve();
        }
      );
    });
  }
}
