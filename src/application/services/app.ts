import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';

@injectable()
export default class AppManager {
  constructor(
    private hookManager: HookManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  quit() {
    this.uiDirector.quitApplication();
    this.hookManager.emit('onAppQuit', {});
  }
}
