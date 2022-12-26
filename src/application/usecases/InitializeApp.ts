import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class InitializeAppUseCase implements UseCase<void> {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    private hookManager: HookManager
  ) {}

  async execute() {
    this.uiDirector.initialize();

    this.hookManager.emit('onAppLaunched', {});
  }
}
