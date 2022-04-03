import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { DomainException } from '@domain/exceptions';
import CaptureSession from '@domain/services/capture';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';
import { UiDirector } from '@application/ports/director';

@injectable()
export default class FinishCaptureUseCase implements UseCase<void> {
  constructor(
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager,
    private captureSession: CaptureSession
  ) {}

  async execute() {
    this.captureModeManager.disableCaptureMode();

    try {
      const finishedCtx = await this.captureSession.finishCapture(
        (curCaptureCtx) => {
          this.hookManager.emit('capture-finishing', {
            captureContext: curCaptureCtx,
          });
        }
      );

      if (await this.captureSession.shouldRevealRecordedFile()) {
        this.uiDirector.showItemInFolder(finishedCtx.outputPath);
      }

      this.hookManager.emit('capture-finished', {
        captureContext: finishedCtx,
      });
    } catch (e) {
      // eslint-disable-next-line no-empty
      if (e instanceof DomainException) {
      }
    }
  }
}
