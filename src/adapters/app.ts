import { app } from 'electron';
import log from 'electron-log';
import { injectable } from 'inversify';

import { isProduction } from '@utils/process';

import type { AppManager } from '@application/ports/app';
import HookManager from '@application/services/hook';

import { version as curVersion, freeVersions } from '../package.json';

// this should be imported after version overriding in dev mode
// eslint-disable-next-line import/order, import/first
import { autoUpdater } from 'electron-updater';

if (!isProduction()) {
  app.getVersion = () => curVersion;
}

@injectable()
export default class ElectronAppManager implements AppManager {
  constructor(private hookManager: HookManager) {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
  }

  getCurAppVersion(): string {
    return app.getVersion();
  }

  isFreeVersion(): boolean {
    return (freeVersions as string[]).includes(this.getCurAppVersion());
  }

  async checkForUpdates(
    onUpdateAvailable: () => void,
    onUpdateNotAvailable: () => void,
    onDownloadProgress: (progressInfo: {
      total: number;
      transferred: number;
    }) => void,
    onUpdateDownloaded: () => void,
  ): Promise<void> {
    autoUpdater.once('update-available', onUpdateAvailable);
    autoUpdater.once('update-not-available', onUpdateNotAvailable);
    autoUpdater.once('download-progress', onDownloadProgress);
    autoUpdater.once('update-downloaded', onUpdateDownloaded);

    return (
      autoUpdater
        .checkForUpdates()
        // eslint-disable-next-line promise/always-return
        .then(() => {})
        .catch(() => {})
    );
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

  quit(): void {
    app.quit();
    this.hookManager.emit('onAppQuit', {});
  }
}
