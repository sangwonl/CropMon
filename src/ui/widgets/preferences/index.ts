/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable promise/param-names */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { app, dialog, ipcMain } from 'electron';

import { IPreferences } from '@core/entities/preferences';
import { assetPathResolver } from '@utils/asset';
import { WidgetType } from '@ui/widgets/types';
import { Widget } from '@ui/widgets/widget';
import { setCustomData } from '@utils/remote';

import {
  IPC_EVT_ON_RECORD_HOME_SELECTION,
  IPC_EVT_ON_CLOSE,
  IPC_EVT_ON_PREFS_UPDATED,
  IpcEvtOnClose,
} from './shared';

export class PreferencesModal extends Widget {
  private prefs: IPreferences | undefined;
  private closeResolver: any | undefined;

  constructor() {
    super(WidgetType.PREFERENECS_MODAL, {
      icon: assetPathResolver('icon.png'),
      show: false,
      width: 640,
      height: 600,
      frame: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
    });

    this.loadURL(`file://${__dirname}/../preferences/index.html`);

    const onRecordHomeSel = async (_event: any, _data: any) => {
      const { filePaths } = await dialog.showOpenDialog(this, {
        defaultPath: this.prefs!.recordHome ?? app.getPath('videos'),
        properties: ['openDirectory'],
      });
      this.prefs!.recordHome = filePaths.length > 0 ? filePaths[0] : '';
      this.notifyPrefsUpdated();
    };

    const onClose = (_event: any, data: IpcEvtOnClose) => {
      this.closeResolver?.(data.preferences);
    };

    ipcMain.on(IPC_EVT_ON_RECORD_HOME_SELECTION, onRecordHomeSel);
    ipcMain.on(IPC_EVT_ON_CLOSE, onClose);

    this.on('close', () => {
      this.closeResolver?.(undefined);
    });

    this.on('closed', () => {
      ipcMain.off(IPC_EVT_ON_RECORD_HOME_SELECTION, onRecordHomeSel);
      ipcMain.off(IPC_EVT_ON_CLOSE, onClose);
    });
  }

  async open(prefs: IPreferences): Promise<IPreferences | undefined> {
    const initialOpen = this.prefs === undefined;
    this.prefs = { ...prefs };
    if (initialOpen) {
      setCustomData<IPreferences>(this, 'initialPrefs', this.prefs);
    }

    this.lazyShow();
    this.notifyPrefsUpdated();

    return new Promise((resolve, _) => {
      this.closeResolver = (result: any) => {
        resolve(result);
        this.hide();
      };
    });
  }

  private notifyPrefsUpdated() {
    this.webContents.send(IPC_EVT_ON_PREFS_UPDATED, {
      preferences: this.prefs,
    });
  }
}
