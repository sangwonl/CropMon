/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/first */
/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable promise/valid-params */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import fs from 'fs';
import { app, dialog } from 'electron';
import { injectable } from 'inversify';
import semver from 'semver';
import log from 'electron-log';

import { UiDirector } from '@presenters/interactor/director';
import { isProduction } from '@utils/process';

import { version as curVersion } from '../../../package.json';

if (!isProduction()) {
  app.getVersion = () => curVersion;
}

// this should be imported after version overriding in dev mode
import { autoUpdater } from 'electron-updater';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { MarkdownPopup } from '@presenters/ui/stateless/containers/markdownpopup';
import { resourceResolver } from '@presenters/common/asset';

@injectable()
export class AppUpdater {
  constructor(
    private prefsUseCase: PreferencesUseCase,
    private uiDirector: UiDirector
  ) {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-available', this.onUpdateAvailable);
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
    autoUpdater.on('download-progress', this.onDownloadProgress);
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
  }

  async checkForUpdates() {
    try {
      await autoUpdater.checkForUpdates();
      this.openReleaseNotesIfUpdated();
    } catch (e) {
      log.error(e);
    }
  }

  private async openReleaseNotesIfUpdated() {
    const prefs = await this.prefsUseCase.getUserPreferences();
    if (semver.gt(curVersion, prefs.version!)) {
      const relNotePath = resourceResolver('RELEASE.md');
      const content = await fs.promises.readFile(relNotePath, 'utf-8');
      const notePopup = new MarkdownPopup({
        width: 440,
        height: 480,
        markdown: content,
      });
      notePopup.on('ready-to-show', () => {
        notePopup.show();
      });

      prefs.version = curVersion;
      await this.prefsUseCase.updateUserPreference(prefs);
    }
  }

  private onUpdateAvailable = async () => {
    const { response: buttonId } = await dialog.showMessageBox({
      title: 'Update Available',
      message:
        'An update is available. Do you want to download and install it now?',
      defaultId: 0,
      cancelId: 1,
      buttons: ['Download and Install', 'Update Later'],
    });

    if (buttonId === 0) {
      this.uiDirector.startDownloadUpdate(
        () => autoUpdater.downloadUpdate(),
        () => {
          autoUpdater.autoInstallOnAppQuit = false;
        },
        () => setImmediate(() => this.uiDirector.quitApplication()),
        (e) => log.error(e)
      );
    }
  };

  private onUpdateNotAvailable = () => {};

  private onDownloadProgress = (progressInfo: any) => {
    const maxPercentage = 0.95; // yield marking 100% to onUpdateDownloaded()
    let percent = 0;
    if (progressInfo.total > 0) {
      percent = Math.floor(
        (progressInfo.transferred / progressInfo.total) * 100 * maxPercentage
      );
    }
    this.uiDirector.setUpdateDownloadProgress(percent);
  };

  private onUpdateDownloaded = () => {
    this.uiDirector.setUpdateDownloadProgress(100);
  };
}
