import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class InitializeAppUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    this.uiDirector.initialize();

    this.hookManager.emit('app-launched', {});
  }
}
