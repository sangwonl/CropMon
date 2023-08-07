import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import type { AppManager } from '@application/ports/app';
import type { UiDirector } from '@application/ports/director';
import type { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class UpdateAppUseCase implements UseCase<void> {
  constructor(
    @inject(TYPES.AppManager) private appManager: AppManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
  ) {}

  execute() {
    this.uiDirector.startDownloadAndInstall(
      () => this.appManager.downloadUpdate(),
      () => this.appManager.cancelUpdate(),
      () => this.appManager.quitAndInstall(),
    );
  }
}
