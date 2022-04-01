import { injectable } from 'inversify';

import { CaptureStatus } from '@domain/models/common';

import { UseCase } from '@application/usecases/UseCase';
import EnableCaptureUseCase from '@application/usecases/EnableCapture';
import FinishCaptureUseCase from '@application/usecases/FinishCapture';
import HookManager from '@application/services/hook';
import CaptureSession from '@application/services/capture/session';

@injectable()
export default class GetCurCaptureCtxUseCase implements UseCase<void> {
  constructor(
    private hookManager: HookManager,
    private captureSession: CaptureSession,
    private enableCaptureUseCase: EnableCaptureUseCase,
    private finishCaptureUseCase: FinishCaptureUseCase
  ) {}

  execute() {
    const captCtx = this.captureSession.getCurCaptureContext();
    if (captCtx?.status === CaptureStatus.IN_PROGRESS) {
      this.finishCaptureUseCase.execute();
    } else {
      this.enableCaptureUseCase.execute();

      this.hookManager.emit('capture-shortcut-triggered', {});
    }
  }
}
