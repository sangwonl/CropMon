/* eslint-disable import/order */
/* eslint-disable import/first */
/* eslint-disable promise/always-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { injectable } from 'inversify';
import { app } from 'electron';
import log from 'electron-log';

import { IAppUpdater } from '@core/services/updater';
import { isProduction } from '@utils/process';

import { version as curVersion } from '../package.json';

if (!isProduction()) {
  app.getVersion = () => curVersion;
}

// this should be imported after version overriding in dev mode
import { autoUpdater } from 'electron-updater';

@injectable()
export default class AppUpdater implements IAppUpdater {
  constructor() {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
  }

  getCurAppVersion(): string {
    return app.getVersion();
  }

  async checkForUpdates(
    onUpdateAvailable: () => void,
    onUpdateNotAvailable: () => void,
    onDownloadProgress: (progressInfo: any) => void,
    onUpdateDownloaded: () => void
  ): Promise<void> {
    this.clearListeners();

    autoUpdater.on('update-available', onUpdateAvailable);
    autoUpdater.on('update-not-available', onUpdateNotAvailable);
    autoUpdater.on('download-progress', onDownloadProgress);
    autoUpdater.on('update-downloaded', onUpdateDownloaded);

    return autoUpdater
      .checkForUpdates()
      .then(() => {})
      .catch(() => {});
  }

  cancelUpdate() {
    autoUpdater.autoInstallOnAppQuit = false;
  }

  downloadUpdate() {
    autoUpdater.downloadUpdate();
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall(true, true);
  }

  private clearListeners() {
    const offListener = (eventName: string) => {
      autoUpdater.listeners(eventName).forEach((l: any) => {
        autoUpdater.off(eventName, l);
      });
    };
    offListener('update-available');
    offListener('update-not-available');
    offListener('download-progress');
    offListener('update-downloaded');
  }
}
