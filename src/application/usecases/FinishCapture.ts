import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { Progress } from '@domain/models/capture';
import CaptureSession from '@domain/services/capture';

import { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';
import { UseCase } from '@application/usecases/UseCase';

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
        },
        (progress: Progress) => {
          console.log(progress.percent);
        }
      );

      if (await this.captureSession.shouldRevealRecordedFile()) {
        this.uiDirector.revealItemInFolder(finishedCtx.outputPath);
      }

      this.hookManager.emit('capture-finished', {
        captureContext: finishedCtx,
        error: !this.captureSession.isFinished(),
      });

      this.captureSession.idle();
    } catch (e) {
      // if (e instanceof DomainException) {}
    }
  }
}
