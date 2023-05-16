import { injectable } from 'inversify';

import AppManager from '@application/services/app';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class QuitAppUseCase implements UseCase<void> {
  constructor(private appManager: AppManager) {}

  execute() {
    this.appManager.quit();
  }
}
