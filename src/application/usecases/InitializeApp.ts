import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import { UiDirector } from '@application/ports/director';

@injectable()
export default class InitializeAppUseCase implements UseCase {
  constructor(
    private hookManager: HookManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    this.uiDirector.initialize();

    this.hookManager.emit('app-launched', {});
  }
}
