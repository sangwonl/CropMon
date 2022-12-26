import { injectable } from 'inversify';

import CaptureSession from '@domain/services/capture';

import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';
import { UseCase } from '@application/usecases/UseCase';

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

    this.hookManager.emit('onCaptureModeDisabled', {});
  }
}
