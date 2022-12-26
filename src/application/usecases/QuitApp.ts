/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class QuitAppUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  execute() {
    this.uiDirector.quitApplication();
    this.hookManager.emit('onAppQuit', {});
  }
}
