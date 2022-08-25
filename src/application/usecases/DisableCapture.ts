import { injectable } from 'inversify';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';
import CaptureSession from '@domain/services/capture';

@injectable()
export default class DisableCaptureUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager,
    private captureSession: CaptureSession
  ) {}

  execute(): void {
    this.captureModeManager.disableCaptureMode();

    this.captureSession.idle();

    this.hookManager.emit('capture-mode-disabled', {});
  }
}
