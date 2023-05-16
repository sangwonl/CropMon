import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { AppManager } from '@application/ports/app';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class QuitAppUseCase implements UseCase<void> {
  constructor(@inject(TYPES.AppManager) private appManager: AppManager) {}

  execute() {
    this.appManager.quit();
  }
}
