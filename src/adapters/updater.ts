/* eslint-disable promise/always-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { app } from 'electron';
import log from 'electron-log';
import { injectable } from 'inversify';

import { isProduction } from '@utils/process';

import { AppUpdater } from '@application/ports/updater';

import { version as curVersion } from '../package.json';

if (!isProduction()) {
  app.getVersion = () => curVersion;
}

// this should be imported after version overriding in dev mode
// eslint-disable-next-line import/order, import/first
import { autoUpdater } from 'electron-updater';

@injectable()
export default class ElectronAppUpdater implements AppUpdater {
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
    const offListener = (eventName: any) => {
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
