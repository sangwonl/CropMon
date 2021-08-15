/* eslint-disable promise/always-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/first */
/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable promise/valid-params */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { app } from 'electron';
import log from 'electron-log';

import { IAppUpdater } from '@core/interfaces/updater';
import { isProduction } from '@utils/process';

import { version as curVersion } from '../package.json';

if (!isProduction()) {
  app.getVersion = () => curVersion;
}

// this should be imported after version overriding in dev mode
import { autoUpdater } from 'electron-updater';

@injectable()
export class AppUpdater implements IAppUpdater {
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
}
