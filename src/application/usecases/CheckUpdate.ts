/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { AppManager } from '@application/ports/app';
import { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';
import LicenseService from '@application/services/license';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class CheckUpdateUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    private licenseService: LicenseService,
    @inject(TYPES.AppManager) private appManager: AppManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    const license = await this.licenseService.checkAndGetLicense();
    if (!license?.validated) {
      if (this.appManager.isFreeVersion()) {
        return;
      }

      // 무료 버전이 아닌데 라이센스가 올바르지 않으면 강제 종료
      this.appManager.quit();
    }

    await this.appManager.checkForUpdates(
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
