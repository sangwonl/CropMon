/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { ipcMain } from 'electron';

import { assetPathResolver } from '@presenters/common/asset';
import { WidgetType } from '@presenters/ui/widgets/types';
import { Widget } from '@presenters/ui/widgets/widget';

import {
  ProgressDialogOptions,
  IPC_EVENT_ON_ACTION_BTN_CLICK,
  IPC_EVENT_SET_PROGRESS,
  IPC_EVENT_ON_CANCEL_BTN_CLICK,
} from './shared';

export class ProgressDialog extends Widget {
  options?: ProgressDialogOptions;

  constructor(options: ProgressDialogOptions) {
    super(WidgetType.PROGRESS_DIALOG, {
      icon: assetPathResolver('icon.png'),
      width: options.width,
      height: options.height,
      options,
    });
    this.options = options;

    this.loadURL(`file://${__dirname}/../progressdialog/index.html`);
  }

  setProgress(progress: number) {
    this.webContents.send(IPC_EVENT_SET_PROGRESS, { progress });
  }

  open(): Promise<boolean> {
    this.show();

    return new Promise((resolve, reject) => {
      const timeout = this.options?.timeout || 300;
      setTimeout(() => reject(), timeout * 1000);

      const onActionBtnClick = () => {
        clearIpcListeners();
        this.hide();
        resolve(true);
      };

      const onCancelBtnClick = () => {
        clearIpcListeners();
        this.hide();
        resolve(false);
      };

      const setupIpcListeners = () => {
        ipcMain.on(IPC_EVENT_ON_ACTION_BTN_CLICK, onActionBtnClick);
        ipcMain.on(IPC_EVENT_ON_CANCEL_BTN_CLICK, onCancelBtnClick);
      };

      const clearIpcListeners = () => {
        ipcMain.off(IPC_EVENT_ON_ACTION_BTN_CLICK, onActionBtnClick);
        ipcMain.off(IPC_EVENT_ON_CANCEL_BTN_CLICK, onCancelBtnClick);
      };

      setupIpcListeners();
    });
  }
}
