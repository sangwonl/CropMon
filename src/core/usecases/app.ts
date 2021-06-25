/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';
import semver from 'semver';

import { TYPES } from '@di/types';
import { IUiDirector } from '@core/interfaces/director';
import { IAppUpdater } from '@core/interfaces/updater';
import { PreferencesUseCase } from './preferences';

@injectable()
export class AppUseCase {
  constructor(
    private prefsUseCase: PreferencesUseCase,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
    @inject(TYPES.AppUpdater) private appUpdater: IAppUpdater
  ) {}

  checkForUpdates = async () => {
    await this.appUpdater.checkForUpdates(
      this.onUpdateAvailable,
      this.onUpdateNotAvailable,
      this.onDownloadProgress,
      this.onUpdateDownloaded
    );

    this.openReleaseNotesIfUpdated();
  };

  showAboutPopup = async () => {
    await this.uiDirector.openAboutPopup();
  };

  quitApplication = () => {
    this.uiDirector.quitApplication();
  };

  private async openReleaseNotesIfUpdated() {
    const prefs = await this.prefsUseCase.getUserPreferences();
    const oldVersion = prefs.version;
    const curVersion = this.appUpdater.getCurAppVersion();
    if (semver.gt(curVersion, oldVersion)) {
      await this.uiDirector.openReleaseNotes();

      prefs.version = curVersion;
      await this.prefsUseCase.updateUserPreference(prefs);
    }
  }

  private onUpdateAvailable = async () => {
    const buttonId = await this.uiDirector.openUpdateAvailableDialog();
    if (buttonId === 0) {
      this.uiDirector.startDownloadUpdate(
        () => this.appUpdater.downloadUpdate(),
        () => this.appUpdater.cancelUpdate(),
        () => setImmediate(() => this.uiDirector.quitApplication(true))
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
