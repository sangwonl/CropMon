/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import { isWin } from '@utils/process';

export class AppUpdater {
  constructor() {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    autoUpdater.on('update-available', this.onUpdateAvailable);
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
  }

  checkForUpdates() {
    // FIXME: it should be disabled for mac until code sign
    if (isWin()) {
      autoUpdater.checkForUpdates();
    }
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
      autoUpdater.quitAndInstall();
    }
  }
}
