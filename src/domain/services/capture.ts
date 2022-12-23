import logger from 'electron-log';
import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import {
  CaptureOptionsNotPreparedException,
  InvalidCaptureStatusException,
} from '@domain/exceptions';
import { CaptureContext, CaptureOptions } from '@domain/models/capture';
import { CaptureStatus } from '@domain/models/common';
import { Progress } from '@domain/models/ui';
import { PreferencesRepository } from '@domain/repositories/preferences';
import { ScreenRecorder } from '@domain/services/recorder';

@injectable()
export default class CaptureSession {
  private curCaptureOptions?: CaptureOptions;
  private curCaptureCtx?: CaptureContext;
  private curCaptureStatus: CaptureStatus;

  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.ScreenRecorder) private screenRecorder: ScreenRecorder
  ) {
    this.curCaptureStatus = CaptureStatus.IN_IDLE;
  }

  public idle(): void {
    this.curCaptureStatus = CaptureStatus.IN_IDLE;
  }

  public selecting(): void {
    this.curCaptureStatus = CaptureStatus.IN_SELECTING;
  }

  public prepare(captureOptions: CaptureOptions): void {
    this.curCaptureOptions = captureOptions;
    this.curCaptureStatus = CaptureStatus.PREPARED;
  }

  public isIdle(): boolean {
    return this.curCaptureStatus === CaptureStatus.IN_IDLE;
  }

  public isInProgress(): boolean {
    return this.curCaptureStatus === CaptureStatus.IN_PROGRESS;
  }

  public isFinished(): boolean {
    return this.curCaptureStatus === CaptureStatus.FINISHED;
  }

  public async startCapture(): Promise<CaptureContext> {
    if (!this.curCaptureOptions) {
      throw new CaptureOptionsNotPreparedException();
    }

    const prefs = await this.prefsRepo.fetchUserPreferences();
    const { target, recordOptions } = this.curCaptureOptions;

    const newCaptureCtx = CaptureContext.create(prefs, target, recordOptions);

    try {
      await this.screenRecorder.record(newCaptureCtx);
      this.curCaptureStatus = CaptureStatus.IN_PROGRESS;
    } catch (e) {
      this.curCaptureStatus = CaptureStatus.ERROR;
      logger.info(e);
    }

    this.curCaptureCtx = newCaptureCtx;

    return newCaptureCtx;
  }

  public async finishCapture(
    onFinishing?: (captureCtx: CaptureContext) => void,
    onPostProgress?: (progress: Progress, captureCtx: CaptureContext) => void,
    onFinished?: () => void
  ): Promise<CaptureContext> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const curCaptureCtx = this.curCaptureCtx!;

    if (this.curCaptureStatus !== CaptureStatus.IN_PROGRESS) {
      throw new InvalidCaptureStatusException(
        `Can't finish capturing which is not in progress`
      );
    }

    try {
      await this.screenRecorder.finish(
        curCaptureCtx,
        () => onFinishing?.(curCaptureCtx),
        (progress) => onPostProgress?.(progress, curCaptureCtx)
      );

      curCaptureCtx.finishCapture();
      this.curCaptureStatus = CaptureStatus.FINISHED;

      onFinished?.();
    } catch (e) {
      this.curCaptureStatus = CaptureStatus.ERROR;
    }

    return curCaptureCtx;
  }

  public abortPostProcess(): void {
    this.screenRecorder.abortPostProcess();
  }

  public async shouldRevealRecordedFile(): Promise<boolean> {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    return (
      this.curCaptureStatus === CaptureStatus.FINISHED &&
      prefs.openRecordHomeWhenRecordCompleted
    );
  }
}
