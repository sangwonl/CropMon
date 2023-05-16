/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { AppManager } from '@application/ports/app';
import { UiDirector } from '@application/ports/director';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class UpdateAppUseCase implements UseCase<void> {
  constructor(
    @inject(TYPES.AppManager) private appManager: AppManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  execute() {
    this.uiDirector.startDownloadAndInstall(
      () => this.appManager.downloadUpdate(),
      () => this.appManager.cancelUpdate(),
      () => this.appManager.quitAndInstall()
    );
  }
}
