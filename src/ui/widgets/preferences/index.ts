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
import {
  IPC_EVT_ON_RECORD_HOME_SELECTION,
  IPC_EVT_ON_CLOSE,
  IPC_EVT_ON_PREFS_UPDATED,
  IpcEvtOnClose,
  PreferencesModalOptions,
} from '@ui/widgets/preferences/shared';

export default class PreferencesModal extends Widget {
  private loaded = false;
  private closeResolver?: any;

  constructor(options: PreferencesModalOptions) {
    super(WidgetType.PREFERENECS_MODAL, {
      icon: assetPathResolver('icon.png'),
      show: false,
      width: 640,
      height: 520,
      resizable: false,
      minimizable: false,
      maximizable: false,
      options,
    });

    this.loadURL(`file://${__dirname}/../preferences/index.html`);

    const onRecordHomeSel = async (_event: any, data: any) => {
      const { prefs } = data;
      const { filePaths } = await dialog.showOpenDialog(this, {
        defaultPath: prefs.recordHome ?? app.getPath('videos'),
        properties: ['openDirectory'],
      });

      if (filePaths.length > 0) {
        const [selectedFilePath] = filePaths;
        const newPrefs: IPreferences = {
          ...prefs,
          recordHome: selectedFilePath,
        };
        this.notifyPrefsUpdated(newPrefs, prefs);
      }
    };

    const onClose = (_event: any, data: IpcEvtOnClose) => {
      this.closeResolver?.(data.preferences);
    };

    ipcMain.on(IPC_EVT_ON_RECORD_HOME_SELECTION, onRecordHomeSel);
    ipcMain.on(IPC_EVT_ON_CLOSE, onClose);

    this.on('close', () => {
      this.closeResolver?.();
    });

    this.on('closed', () => {
      ipcMain.off(IPC_EVT_ON_RECORD_HOME_SELECTION, onRecordHomeSel);
      ipcMain.off(IPC_EVT_ON_CLOSE, onClose);
    });
  }

  async open(
    prefs: IPreferences,
    onSave: (updatedPrefs: IPreferences) => void
  ): Promise<IPreferences | undefined> {
    this.notifyPrefsUpdated(prefs);

    if (this.loaded) {
      this.show();
    } else {
      this.webContents.on('did-finish-load', () => {
        this.loaded = true;
        this.show();
      });
    }

    return new Promise((resolve, _) => {
      this.closeResolver = (result?: IPreferences) => {
        if (result) {
          onSave(result);
          this.notifyPrefsUpdated(result);
        } else {
          resolve(result);
          this.hide();
        }
      };
    });
  }

  private notifyPrefsUpdated(newPrefs: IPreferences, oldPrefs?: IPreferences) {
    this.webContents.send(IPC_EVT_ON_PREFS_UPDATED, {
      oldPrefs: oldPrefs ?? newPrefs,
      newPrefs,
    });
  }
}
