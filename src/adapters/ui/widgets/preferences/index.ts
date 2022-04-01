/* eslint-disable @typescript-eslint/no-explicit-any */

import { app, dialog, ipcMain } from 'electron';

import { Preferences } from '@domain/models/preferences';

import { WidgetType } from '@adapters/ui/widgets/types';
import { Widget } from '@adapters/ui/widgets/widget';
import {
  IPC_EVT_ON_RECORD_HOME_SELECTION,
  IPC_EVT_ON_CLOSE,
  IPC_EVT_ON_PREFS_UPDATED,
  IPC_EVT_ON_SAVE,
  IpcEvtOnSave,
  PreferencesModalOptions,
} from '@adapters/ui/widgets/preferences/shared';

import { assetPathResolver } from '@utils/asset';

export default class PreferencesModal extends Widget {
  private options: PreferencesModalOptions;
  private saveCallback?: (updatedPrefs: Preferences) => void;
  private closeResolver?: any;

  private constructor(options: PreferencesModalOptions) {
    super(WidgetType.PREFERENECS_MODAL, {
      icon: assetPathResolver('icon.png'),
      show: false,
      width: 640,
      height: 520,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      options,
    });

    this.options = options;

    this.loadURL(`file://${__dirname}/../preferences/index.html`);

    const onRecordHomeSel = async (_event: any, data: any) => {
      const { prefs } = data;
      const { filePaths } = await dialog.showOpenDialog(this, {
        defaultPath: prefs.recordHome ?? app.getPath('videos'),
        properties: ['openDirectory'],
      });

      if (filePaths.length > 0) {
        const [selectedFilePath] = filePaths;
        const newPrefs: Preferences = {
          ...prefs,
          recordHome: selectedFilePath,
        };
        this.notifyPrefsUpdated(newPrefs, prefs);
      }
    };

    const onSave = (_event: any, data: IpcEvtOnSave) => {
      const { preferences } = data;
      this.saveCallback?.(preferences);
      this.notifyPrefsUpdated(preferences);
    };

    const onClose = () => {
      this.close();
    };

    this.on('close', () => {
      this.closeResolver?.();
    });

    ipcMain.on(IPC_EVT_ON_RECORD_HOME_SELECTION, onRecordHomeSel);
    ipcMain.on(IPC_EVT_ON_SAVE, onSave);
    ipcMain.on(IPC_EVT_ON_CLOSE, onClose);

    this.on('closed', () => {
      ipcMain.off(IPC_EVT_ON_RECORD_HOME_SELECTION, onRecordHomeSel);
      ipcMain.off(IPC_EVT_ON_SAVE, onSave);
      ipcMain.off(IPC_EVT_ON_CLOSE, onClose);
    });
  }

  private async openAsModal(
    onSave: (updatedPrefs: Preferences) => void
  ): Promise<void> {
    this.notifyPrefsUpdated(this.options.preferences);

    this.webContents.on('did-finish-load', () => {
      this.show();
      this.focus();
    });

    return new Promise((resolve) => {
      this.saveCallback = onSave;
      this.closeResolver = resolve;
    });
  }

  private notifyPrefsUpdated(newPrefs: Preferences, oldPrefs?: Preferences) {
    this.webContents.send(IPC_EVT_ON_PREFS_UPDATED, {
      oldPrefs: oldPrefs ?? newPrefs,
      newPrefs,
    });
  }

  async doModal(onSave: (updatedPrefs: Preferences) => void): Promise<void> {
    await this.openAsModal(onSave);
  }

  static create(options: PreferencesModalOptions): PreferencesModal {
    return new PreferencesModal(options);
  }
}
