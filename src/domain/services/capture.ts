import { inject, injectable } from 'inversify';
import path from 'path';

import TYPES from '@di/types';

import { CaptureStatus } from '@domain/models/common';
import {
  CaptureContext,
  CaptureOptions,
  CaptureTarget,
  RecordOptions,
} from '@domain/models/capture';
import { Preferences } from '@domain/models/preferences';
import { PreferencesRepository } from '@domain/repositories/preferences';
import { ScreenRecorder } from '@domain/services/recorder';
import {
  CaptureOptionsNotPreparedException,
  InvalidCaptureStatusException,
} from '@domain/exceptions';

import { getNowAsYYYYMMDDHHmmss, getTimeInSeconds } from '@utils/date';

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

    const newCaptureCtx = this.createCaptureContext(
      prefs,
      target,
      recordOptions
    );

    try {
      await this.screenRecorder.record(newCaptureCtx);
      newCaptureCtx.status = CaptureStatus.IN_PROGRESS;
    } catch (e) {
      newCaptureCtx.status = CaptureStatus.ERROR;
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
    if (!this.isCaptureInProgress()) {
      throw new InvalidCaptureStatusException(
        `Can't finish capturing which is not in progress`
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const curCaptureCtx = this.curCaptureCtx!;
    finishingCallback(curCaptureCtx);

    let newStatus = curCaptureCtx.status;
    try {
      await this.screenRecorder.finish(curCaptureCtx);
      newStatus = CaptureStatus.FINISHED;
    } catch (e) {
      newStatus = CaptureStatus.ERROR;
    }

    const updatedCaptureCtx = {
      ...curCaptureCtx,
      status: newStatus,
      finishedAt: getTimeInSeconds(),
    };

    this.curCaptureCtx = updatedCaptureCtx;

    return updatedCaptureCtx;
  }

  isCaptureInProgress(): boolean {
    return this.curCaptureCtx?.status === CaptureStatus.IN_PROGRESS;
  }

  isCaptureFinished(): boolean {
    return this.curCaptureCtx?.status === CaptureStatus.FINISHED;
  }

  async shouldRevealRecordedFile(): Promise<boolean> {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    return this.isCaptureFinished() && prefs.openRecordHomeWhenRecordCompleted;
  }

  private createCaptureContext(
    prefs: Preferences,
    target: CaptureTarget,
    recordOptions: RecordOptions
  ): CaptureContext {
    const fileName = getNowAsYYYYMMDDHHmmss();
    const output = path.join(
      prefs.recordHome,
      `${fileName}.${prefs.outputFormat}`
    );

    return {
      target,
      status: CaptureStatus.PREPARED,
      createdAt: getTimeInSeconds(),
      outputPath: output,
      outputFormat: recordOptions.enableOutputAsGif ? 'gif' : 'mp4',
      lowQualityMode: recordOptions.enableLowQualityMode ?? false,
      recordMicrophone: recordOptions.enableMicrophone ?? false,
    };
  }
}
