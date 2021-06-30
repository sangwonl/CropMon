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
  private forceClose = false;
  private prefs: IPreferences | undefined;
  private closeResolver: any | undefined;

  constructor() {
    super(WidgetType.PREFERENECS_MODAL, {
      icon: assetPathResolver('icon.png'),
      show: false,
      width: 640,
      height: 450,
      frame: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
    });

    this.loadURL(`file://${__dirname}/../preferences/index.html`);

    ipcMain.on(
      IPC_EVT_ON_RECORD_HOME_SELECTION,
      async (_event: any, _data: any) => {
        const { filePaths } = await dialog.showOpenDialog(this, {
          defaultPath: this.prefs!.recordHome ?? app.getPath('videos'),
          properties: ['openDirectory'],
        });
        this.prefs!.recordHome = filePaths.length > 0 ? filePaths[0] : '';
        this.notifyPrefsUpdated();
      }
    );

    ipcMain.on(IPC_EVT_ON_CLOSE, (_event: any, data: IpcEvtOnClose) => {
      this.closeResolver?.(data.preferences);
    });

    this.on('close', (event) => {
      if (!this.forceClose) {
        event.preventDefault();
      }
      this.closeResolver?.(undefined);
    });
  }

  async open(prefs: IPreferences): Promise<IPreferences | undefined> {
    const initialOpen = this.prefs === undefined;
    this.prefs = { ...prefs };
    if (initialOpen) {
      setCustomData<IPreferences>(this, 'initialPrefs', this.prefs);
    }

    this.notifyPrefsUpdated();
    this.show();

    return new Promise((resolve, _) => {
      this.closeResolver = (result: any) => {
        resolve(result);
        this.hide();
      };
    });
  }

  close() {
    this.forceClose = true;
    super.close();
  }

  private notifyPrefsUpdated() {
    this.webContents.send(IPC_EVT_ON_PREFS_UPDATED, {
      preferences: this.prefs,
    });
  }
}
