import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { CaptureContext, CaptureOptions } from '@domain/models/capture';
import { PreferencesRepository } from '@domain/repositories/preferences';
import { ScreenRecorder } from '@domain/services/recorder';
import {
  CaptureOptionsNotPreparedException,
  InvalidCaptureStatusException,
} from '@domain/exceptions';

@injectable()
export default class CaptureSession {
  private curCaptureOptions?: CaptureOptions;
  private curCaptureCtx?: CaptureContext;

  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.ScreenRecorder) private screenRecorder: ScreenRecorder
  ) {}

  prepareCapture(captureOptions: CaptureOptions): void {
    this.curCaptureOptions = captureOptions;
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
      newCaptureCtx.setToInProgress();
    } catch (e) {
      newCaptureCtx.setToError();
    }

    this.curCaptureCtx = newCaptureCtx;

    return newCaptureCtx;
  }

  getCurCaptureContext(): CaptureContext | undefined {
    return this.curCaptureCtx;
  }

  async finishCapture(
    finishingCallback: (curCaptureCtx: CaptureContext) => void
  ): Promise<CaptureContext> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const curCaptureCtx = this.curCaptureCtx!;

    if (!curCaptureCtx.isInProgress) {
      throw new InvalidCaptureStatusException(
        `Can't finish capturing which is not in progress`
      );
    }

    finishingCallback(curCaptureCtx);

    try {
      await this.screenRecorder.finish(curCaptureCtx);
      curCaptureCtx.setToFinished();
    } catch (e) {
      curCaptureCtx.setToError();
    }

    return curCaptureCtx;
  }

  async shouldRevealRecordedFile(): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const curCaptureCtx = this.curCaptureCtx!;
    const prefs = await this.prefsRepo.fetchUserPreferences();
    return curCaptureCtx.isFinished && prefs.openRecordHomeWhenRecordCompleted;
  }

  isCaptureInProgress(): boolean {
    return this.curCaptureCtx?.isInProgress ?? false;
  }

  isCaptureFinished(): boolean {
    return this.curCaptureCtx?.isFinished ?? false;
  }
}
