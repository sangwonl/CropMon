/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export class AppUpdater {
  constructor() {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    autoUpdater.on('update-available', this.onUpdateAvailable);
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
  }

  checkForUpdates() {
    autoUpdater.checkForUpdates();
  }

  private onUpdateAvailable() {
    autoUpdater.downloadUpdate();
  }

  private onUpdateNotAvailable() {}

  private async onUpdateDownloaded() {
    const result = await dialog.showMessageBox({
      title: 'Install Updates',
      message: 'Updates are ready to be installed.',
      defaultId: 0,
      cancelId: 1,
      buttons: ['Install and Restart', 'Close'],
    });

    const buttonId = result.response;
    if (buttonId === 0) {
      this.closeAllWindows();
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  }

  private closeAllWindows() {
    app.removeAllListeners('window-all-closed');
    BrowserWindow.getAllWindows().forEach((w) => {
      w.removeAllListeners('close');
    });
  }
}
