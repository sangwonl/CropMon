import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { CaptureContext, Progress } from '@domain/models/capture';
import CaptureSession from '@domain/services/capture';

import { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';
import { UseCase } from '@application/usecases/UseCase';

const CONTAINING_PROGRESS = 10;

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
        async (captureCtx: CaptureContext) => {
          this.hookManager.emit('capture-finishing', {
            captureContext: captureCtx,
          });

          this.uiDirector.updatePostProcessMsg('Containing recorded media...');
          this.uiDirector.progressPostProcess(CONTAINING_PROGRESS);
          const done = await this.uiDirector.openPostProcessDialog();
          if (!done) {
            this.captureSession.abortPostProcess();
          }
        },
        (progress: Progress, captureCtx: CaptureContext) => {
          if (captureCtx.outputFormat === 'gif') {
            this.uiDirector.updatePostProcessMsg('Converting to GIF format...');
          }
          this.uiDirector.progressPostProcess(
            progress.percent + CONTAINING_PROGRESS
          );
        },
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
