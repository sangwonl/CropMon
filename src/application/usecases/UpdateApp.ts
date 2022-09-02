/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UiDirector } from '@application/ports/director';
import { UseCase } from '@application/usecases/UseCase';

import AppUpdater from '@adapters/updater';

@injectable()
export default class UpdateAppUseCase implements UseCase<void> {
  constructor(
    @inject(TYPES.AppUpdater) private appUpdater: AppUpdater,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  execute() {
    this.uiDirector.startDownloadAndInstall(
      () => this.appUpdater.downloadUpdate(),
      () => this.appUpdater.cancelUpdate(),
      () => this.appUpdater.quitAndInstall()
    );
  }
}
