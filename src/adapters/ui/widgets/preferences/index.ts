import { BrowserWindow, ipcMain } from 'electron';

import { assetPathResolver } from '@utils/asset';
import { isDebugMode } from '@utils/process';

import {
  IPC_EVT_ON_CLOSE,
  type PreferencesDialogOptions,
} from '@adapters/ui/widgets/preferences/shared';
import { WidgetType } from '@adapters/ui/widgets/types';
import { Widget } from '@adapters/ui/widgets/widget';

export class PreferencesDialog extends Widget<PreferencesDialogOptions> {
  private constructor(options: PreferencesDialogOptions) {
    super(WidgetType.PREFERENECS_DIALOG, options);

    this.window.loadURL(`file://${__dirname}/../preferences/index.html`);

    const onClose = () => this.close();

    ipcMain.on(IPC_EVT_ON_CLOSE, onClose);

    this.window.on('closed', () => {
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

  static create(options: PreferencesDialogOptions): PreferencesDialog {
    return new PreferencesDialog(options);
  }
}
