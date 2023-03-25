/* eslint-disable @typescript-eslint/no-explicit-any */

import { app, BrowserWindow, dialog, ipcMain } from 'electron';

import { assetPathResolver } from '@utils/asset';
import { isDebugMode } from '@utils/process';

import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';

import {
  IPC_EVT_ON_RECORD_HOME_SELECTION,
  IPC_EVT_ON_REGISTER,
  IPC_EVT_ON_SAVE,
  IPC_EVT_ON_CLOSE,
  IPC_EVT_ON_LICENSE_UPDATED,
  IPC_EVT_ON_PREFS_UPDATED,
  IpcEvtOnRegister,
  IpcEvtOnSave,
  PreferencesModalOptions,
} from '@adapters/ui/widgets/preferences/shared';
import { WidgetType } from '@adapters/ui/widgets/types';
import Widget from '@adapters/ui/widgets/widget';

export default class PreferencesModal extends Widget {
  private registerCallback?: (licenseKey: string) => License;
  private saveCallback?: (updatedPrefs: Preferences) => void;
  private closeResolver?: any;

  private constructor(private options: PreferencesModalOptions) {
    super(WidgetType.PREFERENECS_MODAL, options);

    this.window.loadURL(`file://${__dirname}/../preferences/index.html`);

    const onRecordHomeSel = async (_event: any, data: any) => {
      const { prefs } = data;
      const { filePaths } = await dialog.showOpenDialog(this.window, {
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

    const onRegister = (_event: any, data: IpcEvtOnRegister) => {
      const license = this.registerCallback?.(data.licenseKey);
      if (license) {
        this.notifyLicenseUpdated(license);
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

    this.window.on('close', () => {
      this.closeResolver?.();
    });

    ipcMain.on(IPC_EVT_ON_REGISTER, onRegister);
    ipcMain.on(IPC_EVT_ON_RECORD_HOME_SELECTION, onRecordHomeSel);
    ipcMain.on(IPC_EVT_ON_SAVE, onSave);
    ipcMain.on(IPC_EVT_ON_CLOSE, onClose);

    this.window.on('closed', () => {
      ipcMain.off(IPC_EVT_ON_REGISTER, onRegister);
      ipcMain.off(IPC_EVT_ON_RECORD_HOME_SELECTION, onRecordHomeSel);
      ipcMain.off(IPC_EVT_ON_SAVE, onSave);
      ipcMain.off(IPC_EVT_ON_CLOSE, onClose);
    });
  }

  protected createWindow(): BrowserWindow {
    return new BrowserWindow({
      icon: assetPathResolver('icon.png'),
      show: false,
      width: 640,
      height: 500,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      webPreferences: {
        devTools: isDebugMode(),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  }

  private async openAsModal(
    onSave: (updatedPrefs: Preferences) => void,
    onRegister: (licenseKey: string) => License
  ): Promise<void> {
    this.notifyPrefsUpdated(this.options.preferences);
    this.notifyLicenseUpdated(this.options.license);

    this.window.webContents.on('did-finish-load', () => {
      this.show();
      this.focus();
    });

    return new Promise((resolve) => {
      this.saveCallback = onSave;
      this.registerCallback = onRegister;
      this.closeResolver = resolve;
    });
  }

  private notifyPrefsUpdated(newPrefs: Preferences, oldPrefs?: Preferences) {
    this.window.webContents.send(IPC_EVT_ON_PREFS_UPDATED, {
      oldPrefs: oldPrefs ?? newPrefs,
      newPrefs,
    });
  }

  private notifyLicenseUpdated(license: License | null) {
    this.window.webContents.send(IPC_EVT_ON_LICENSE_UPDATED, {
      license,
    });
  }

  async doModal(
    onSave: (updatedPrefs: Preferences) => void,
    onRegister: (licenseKey: string) => License
  ): Promise<void> {
    await this.openAsModal(onSave, onRegister);
  }

  static create(options: PreferencesModalOptions): PreferencesModal {
    return new PreferencesModal(options);
  }
}
