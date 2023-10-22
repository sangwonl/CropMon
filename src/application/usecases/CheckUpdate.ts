import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';

import type { AppManager } from '@application/ports/app';
import type { UiDirector } from '@application/ports/director';
import { HookManager } from '@application/services/hook';
import type { UseCase } from '@application/usecases/UseCase';

@injectable()
export class CheckUpdateUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    @inject(TYPES.AppManager) private appManager: AppManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
  ) {}

  async execute() {
    await this.appManager.checkForUpdates(
      this.onUpdateAvailable,
      this.onUpdateNotAvailable,
      this.onDownloadProgress,
      this.onUpdateDownloaded,
    );
  }

  private onUpdateAvailable = async () => {
    this.hookManager.emit('onAppUpdateChecked', { updateAvailable: true });
  };

  private onUpdateNotAvailable = () => {
    this.hookManager.emit('onAppUpdateChecked', { updateAvailable: false });
  };

  private onDownloadProgress = (progressInfo: {
    total: number;
    transferred: number;
  }) => {
    const maxPercentage = 0.95; // yield marking 100% to onUpdateDownloaded()
    let percent = 0;
    if (progressInfo.total > 0) {
      percent = Math.floor(
        (progressInfo.transferred / progressInfo.total) * 100 * maxPercentage,
      );
    }
    this.uiDirector.progressUpdateDownload(percent);
  };

  private onUpdateDownloaded = () => {
    this.uiDirector.progressUpdateDownload(100);
  };
}
