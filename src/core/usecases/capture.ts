/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import path from 'path';
import assert from 'assert';
import dayjs from 'dayjs';
import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import {
  CaptureStatus,
  ICaptureContext,
  ICaptureOption,
  createCaptureContext,
} from '@core/entities/capture';
import { GlobalRegistry } from '@core/components/registry';
import { IScreenRecorder } from '@core/components/recorder';
import { IAnalyticsTracker } from '@core/components/tracker';

@injectable()
export class CaptureUseCase {
  constructor(
    private globalRegistry: GlobalRegistry,
    @inject(TYPES.ScreenRecorder) private screenRecorder: IScreenRecorder,
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker
  ) {}

  async startCapture(option: ICaptureOption): Promise<ICaptureContext | never> {
    const ctx = createCaptureContext(option);
    ctx.outputPath = this.getOutputPath();
    this.globalRegistry.setCaptureContext(ctx);

    try {
      await this.screenRecorder.record(ctx);
      ctx.status = CaptureStatus.IN_PROGRESS;
      this.tracker.eventL('capture', 'start-capture', 'success');
    } catch (e) {
      ctx.status = CaptureStatus.ERROR;
      this.tracker.eventL('capture', 'start-capture', 'fail');
    }

    return ctx;
  }

  pauseCapture() {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);
  }

  resumeCapture() {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);
  }

  finishCapture(): ICaptureContext | never {
    const curCtx = this.globalRegistry.getCaptureContext();
    assert(curCtx !== undefined);

    let newStatus = curCtx.status;
    try {
      this.screenRecorder.finish(curCtx);
      newStatus = CaptureStatus.FINISHED;

      const duration = dayjs().second() - curCtx.createdAt;
      this.tracker.eventLV('capture', 'finish-capture', 'duration', duration);
    } catch (e) {
      newStatus = CaptureStatus.ERROR;
      this.tracker.eventL('capture', 'finish-capture', 'fail');
    }

    return { ...curCtx, status: newStatus };
  }

  private getOutputPath(): string {
    const userPrefs = this.globalRegistry.getUserPreferences();
    const fileName = dayjs().format('YYYYMMDDHHmmss');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return path.join(userPrefs!.recordHomeDir!, `${fileName}.mp4`);
  }
}
