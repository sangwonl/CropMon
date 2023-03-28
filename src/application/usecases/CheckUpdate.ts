/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UiDirector } from '@application/ports/director';
import { LicenseManager } from '@application/ports/license';
import { AppUpdater } from '@application/ports/updater';
import HookManager from '@application/services/hook';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class CheckUpdateUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    @inject(TYPES.AppUpdater) private appUpdater: AppUpdater,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    @inject(TYPES.LicenseManager) private licenseManager: LicenseManager
  ) {}

  async execute() {
    const license = await this.licenseManager.retrieveLicense();
    if (!license?.validated) {
      return;
    }

    await this.appUpdater.checkForUpdates(
      this.onUpdateAvailable,
      this.onUpdateNotAvailable,
      this.onDownloadProgress,
      this.onUpdateDownloaded
    );
  }

  private onUpdateAvailable = async () => {
    this.hookManager.emit('onAppUpdateChecked', { updateAvailable: true });
  };

  private onUpdateNotAvailable = () => {
    this.hookManager.emit('onAppUpdateChecked', { updateAvailable: false });
  };

  private onDownloadProgress = (progressInfo: any) => {
    const maxPercentage = 0.95; // yield marking 100% to onUpdateDownloaded()
    let percent = 0;
    if (progressInfo.total > 0) {
      percent = Math.floor(
        (progressInfo.transferred / progressInfo.total) * 100 * maxPercentage
      );
    }
    this.uiDirector.progressUpdateDownload(percent);
  };

  private onUpdateDownloaded = () => {
    this.uiDirector.progressUpdateDownload(100);
  };
}
