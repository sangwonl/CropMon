import { injectable } from 'inversify';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';

@injectable()
export default class DisableCaptureUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager
  ) {}

  execute(): void {
    this.captureModeManager.disableCaptureMode();

    this.hookManager.emit('capture-mode-disabled', {});
  }
}
