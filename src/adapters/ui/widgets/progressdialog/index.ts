/* eslint-disable @typescript-eslint/no-use-before-define */

import { ipcMain } from 'electron';

import { WidgetType } from '@adapters/ui/widgets/types';
import { Widget } from '@adapters/ui/widgets/widget';

import { assetPathResolver } from '@utils/asset';

import {
  ProgressDialogOptions,
  IPC_EVT_ON_ACTION,
  IPC_EVT_SET_PROGRESS,
  IPC_EVT_ON_CANCEL,
} from './shared';

export default class ProgressDialog extends Widget {
  options?: ProgressDialogOptions;

  constructor(options: ProgressDialogOptions) {
    super(WidgetType.PROGRESS_DIALOG, {
      icon: assetPathResolver('icon.png'),
      show: false,
      width: options.width,
      height: options.height,
      resizable: false,
      maximizable: false,
      minimizable: false,
      closable: true,
      options,
    });
    this.options = options;

    this.window.loadURL(`file://${__dirname}/../progressdialog/index.html`);

    this.window.on('ready-to-show', () => options.onReady?.());
  }

  setProgress(progress: number) {
    this.window.webContents.send(IPC_EVT_SET_PROGRESS, { progress });
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
        ipcMain.on(IPC_EVT_ON_ACTION, onActionBtnClick);
        ipcMain.on(IPC_EVT_ON_CANCEL, onCancelBtnClick);
      };

      const clearIpcListeners = () => {
        ipcMain.off(IPC_EVT_ON_ACTION, onActionBtnClick);
        ipcMain.off(IPC_EVT_ON_CANCEL, onCancelBtnClick);
      };

      setupIpcListeners();
    });
  }
}
