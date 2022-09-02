import logger from 'electron-log';
import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import {
  CaptureOptionsNotPreparedException,
  InvalidCaptureStatusException,
} from '@domain/exceptions';
import { CaptureContext, CaptureOptions } from '@domain/models/capture';
import { CaptureStatus } from '@domain/models/common';
import { PreferencesRepository } from '@domain/repositories/preferences';
import { ScreenRecorder } from '@domain/services/recorder';

@injectable()
export default class CaptureSession {
  private curCaptureOptions?: CaptureOptions;
  private curCaptureCtx?: CaptureContext;
  private captureStatus: CaptureStatus;

  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.ScreenRecorder) private screenRecorder: ScreenRecorder
  ) {
    this.captureStatus = CaptureStatus.IN_IDLE;
  }

  idle(): void {
    this.captureStatus = CaptureStatus.IN_IDLE;
  }

  selecting(): void {
    this.captureStatus = CaptureStatus.IN_SELECTING;
  }

  prepare(captureOptions: CaptureOptions): void {
    this.curCaptureOptions = captureOptions;
    this.captureStatus = CaptureStatus.PREPARED;
  }

  isIdle(): boolean {
    return this.captureStatus === CaptureStatus.IN_IDLE;
  }

  isInProgress(): boolean {
    return this.captureStatus === CaptureStatus.IN_PROGRESS;
  }

  isFinished(): boolean {
    return this.captureStatus === CaptureStatus.FINISHED;
  }

  async startCapture(): Promise<CaptureContext> {
    if (!this.curCaptureOptions) {
      throw new CaptureOptionsNotPreparedException();
    }

    const prefs = await this.prefsRepo.fetchUserPreferences();
    const { target, recordOptions } = this.curCaptureOptions;

    const newCaptureCtx = CaptureContext.create(prefs, target, recordOptions);

    try {
      await this.screenRecorder.record(newCaptureCtx);
      this.captureStatus = CaptureStatus.IN_PROGRESS;
    } catch (e) {
      this.captureStatus = CaptureStatus.ERROR;
      logger.info(e);
    }

    this.curCaptureCtx = newCaptureCtx;

    return newCaptureCtx;
  }

  async finishCapture(
    finishingCallback: (curCaptureCtx: CaptureContext) => void
  ): Promise<CaptureContext> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const curCaptureCtx = this.curCaptureCtx!;

    if (this.captureStatus !== CaptureStatus.IN_PROGRESS) {
      throw new InvalidCaptureStatusException(
        `Can't finish capturing which is not in progress`
      );
    }

    finishingCallback(curCaptureCtx);

    try {
      await this.screenRecorder.finish(curCaptureCtx);
      curCaptureCtx.finishCapture();
      this.captureStatus = CaptureStatus.FINISHED;
    } catch (e) {
      this.captureStatus = CaptureStatus.ERROR;
    }

    return curCaptureCtx;
  }

  async shouldRevealRecordedFile(): Promise<boolean> {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    return (
      this.captureStatus === CaptureStatus.FINISHED &&
      prefs.openRecordHomeWhenRecordCompleted
    );
  }
}
