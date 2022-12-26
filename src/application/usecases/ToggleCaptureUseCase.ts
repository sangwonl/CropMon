import { injectable } from 'inversify';

import CaptureSession from '@domain/services/capture';

import HookManager from '@application/services/hook';
import EnableCaptureUseCase from '@application/usecases/EnableCapture';
import FinishCaptureUseCase from '@application/usecases/FinishCapture';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class ToggleCaptureUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    private captureSession: CaptureSession,
    private enableCaptureUseCase: EnableCaptureUseCase,
    private finishCaptureUseCase: FinishCaptureUseCase
  ) {}

  execute() {
    if (this.captureSession.isInProgress()) {
      this.finishCaptureUseCase.execute();
    } else {
      this.enableCaptureUseCase.execute();

      this.hookManager.emit('onCaptureShortcutTriggered', {});
    }
  }
}
