/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UseCase } from '@application/usecases/UseCase';
import { UiDirector } from '@application/ports/director';

import AppUpdater from '@adapters/updater';

@injectable()
export default class UpdateAppUseCase implements UseCase {
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
