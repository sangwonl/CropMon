/* eslint-disable promise/valid-params */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import { diContainer } from '@di/container';
import { UiDirector } from '@presenters/interactor/director';

const uiDirector = diContainer.get(UiDirector);

class AppUpdater {
  constructor() {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-available', this.onUpdateAvailable);
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
  }

  async checkForUpdates() {
    autoUpdater.checkForUpdates().catch(() => {});
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
      uiDirector.quitApplication();
    }
  }
}

export const configureAppUpdater = () => {
  new AppUpdater().checkForUpdates();
};
