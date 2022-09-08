/* eslint-disable @typescript-eslint/no-use-before-define */

import { BrowserWindow, ipcMain } from 'electron';

import { assetPathResolver } from '@utils/asset';
import { isDebugMode } from '@utils/process';

import { WidgetType } from '@adapters/ui/widgets/types';
import Widget from '@adapters/ui/widgets/widget';

import {
  ProgressDialogOptions,
  IPC_EVT_ON_ACTION,
  IPC_EVT_SET_PROGRESS,
  IPC_EVT_ON_CANCEL,
  IPC_EVT_SET_MESSAGE,
} from './shared';

export default class ProgressDialog extends Widget {
  constructor(private options: ProgressDialogOptions) {
    super(WidgetType.PROGRESS_DIALOG, options);

    this.window.loadURL(`file://${__dirname}/../progressdialog/index.html`);

    this.window.on('ready-to-show', () => options.onReady?.());
  }

  protected createWindow({ width, height }: any): BrowserWindow {
    return new BrowserWindow({
      icon: assetPathResolver('icon.png'),
      show: false,
      width,
      height,
      resizable: false,
      maximizable: false,
      minimizable: false,
      closable: true,
      webPreferences: {
        devTools: isDebugMode(),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  }

  setProgress(progress: number) {
    this.window.webContents.send(IPC_EVT_SET_PROGRESS, { progress });
  }

  setMessage(message: string) {
    this.window.webContents.send(IPC_EVT_SET_MESSAGE, { message });
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

  close(): void {
    this.setProgress(0);
    setTimeout(() => {
      this.hide();
    });
  }
}
