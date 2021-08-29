/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';
import semver from 'semver';

import { TYPES } from '@di/types';
import { IUiDirector } from '@core/interfaces/director';
import { IAppUpdater } from '@core/interfaces/updater';
import { IHookManager } from '@core/interfaces/hook';

import { PreferencesUseCase } from './preferences';

@injectable()
export class AppUseCase {
  constructor(
    private prefsUseCase: PreferencesUseCase,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
    @inject(TYPES.AppUpdater) private appUpdater: IAppUpdater,
    @inject(TYPES.HookManager) private hookManager: IHookManager
  ) {}

  async initializeApp() {
    this.uiDirector.initialize();

    this.hookManager.emit('app-launched', {});
  }

  async checkAppVersions() {
    const prefs = await this.prefsUseCase.fetchUserPreferences();
    const oldVersion = prefs.version;
    const curVersion = this.appUpdater.getCurAppVersion();

    if (curVersion !== oldVersion) {
      prefs.version = curVersion;
      await this.prefsUseCase.updateUserPreference(prefs);
    }

    if (semver.gt(curVersion, oldVersion)) {
      this.hookManager.emit('app-updated', { oldVersion, curVersion });
    }
  }

  async checkForUpdates() {
    await this.appUpdater.checkForUpdates(
      this.onUpdateAvailable,
      this.onUpdateNotAvailable,
      this.onDownloadProgress,
      this.onUpdateDownloaded
    );
  }

  async showAboutPopup() {
    const prefs = await this.prefsUseCase.fetchUserPreferences();
    await this.uiDirector.openAboutPagePopup(prefs);
  }

  async showHelpPopup() {
    await this.uiDirector.openHelpPagePopup();
  }

  quitApplication() {
    this.uiDirector.quitApplication();
  }

  downloadAndInstall() {
    this.uiDirector.startDownloadAndInstall(
      () => this.appUpdater.downloadUpdate(),
      () => this.appUpdater.cancelUpdate(),
      () => this.appUpdater.quitAndInstall()
    );
  }

  private onUpdateAvailable = async () => {
    this.hookManager.emit('app-update-checked', { updateAvailable: true });
  };

  private onUpdateNotAvailable = () => {
    this.hookManager.emit('app-update-checked', { updateAvailable: false });
  };

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
