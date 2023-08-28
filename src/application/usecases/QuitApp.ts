import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';

import type { AppManager } from '@application/ports/app';
import type { UseCase } from '@application/usecases/UseCase';

@injectable()
export class QuitAppUseCase implements UseCase<void> {
  constructor(@inject(TYPES.AppManager) private appManager: AppManager) {}

  execute() {
    this.appManager.quit();
  }
}
