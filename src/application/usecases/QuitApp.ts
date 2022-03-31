/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import { UiDirector } from '@application/ports/director';

@injectable()
export default class QuitAppUseCase implements UseCase {
  constructor(
    private hookManager: HookManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  execute() {
    this.uiDirector.quitApplication();
    this.hookManager.emit('app-quit', {});
  }
}
