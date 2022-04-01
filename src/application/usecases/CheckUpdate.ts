/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import { UiDirector } from '@application/ports/director';
import { AppUpdater } from '@application/ports/updater';

@injectable()
export default class CheckUpdateUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    @inject(TYPES.AppUpdater) private appUpdater: AppUpdater,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    await this.appUpdater.checkForUpdates(
      this.onUpdateAvailable,
      this.onUpdateNotAvailable,
      this.onDownloadProgress,
      this.onUpdateDownloaded
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
