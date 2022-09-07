import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { CaptureContext, Progress } from '@domain/models/capture';
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
        async (curCaptureCtx: CaptureContext) => {
          this.hookManager.emit('capture-finishing', {
            captureContext: curCaptureCtx,
          });

          if (curCaptureCtx.outputFormat === 'gif') {
            const done = await this.uiDirector.openPostProcessDialog();
            if (!done) {
              this.captureSession.abortPostProcess();
            }
          }
        },
        (progress: Progress) =>
          this.uiDirector.progressPostProcess(progress.percent),
        () => this.uiDirector.progressPostProcess(100)
      );
      this.uiDirector.closePostProcessDialog();

      const done = this.captureSession.isFinished();
      if (done && (await this.captureSession.shouldRevealRecordedFile())) {
        this.uiDirector.revealItemInFolder(finishedCtx.outputPath);
      }

      this.hookManager.emit('capture-finished', {
        captureContext: finishedCtx,
        error: !done,
      });

      this.captureSession.idle();
    } catch (e) {
      // if (e instanceof DomainException) {}
    }
  }
}
