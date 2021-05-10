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
import { IGlobalRegistry, IScreenRecorder } from '@core/components';

@injectable()
export class CaptureUseCase {
  public constructor(
    private globalRegistry: IGlobalRegistry,
    @inject(TYPES.ScreenRecorder) private screenRecorder: IScreenRecorder
  ) {}

  public startCapture(option: ICaptureOption): ICaptureContext | never {
    const ctx = createCaptureContext(option);
    ctx.outputPath = this.getOutputPath();
    this.globalRegistry.setCaptureContext(ctx);

    try {
      this.screenRecorder.record(ctx);
      ctx.status = CaptureStatus.IN_PROGRESS;
    } catch (e) {
      ctx.status = CaptureStatus.ERROR;
    }

    return ctx;
  }

  public pauseCapture() {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);
  }

  public resumeCapture() {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);
  }

  public finishCapture(): ICaptureContext | never {
    const curCtx = this.globalRegistry.getCaptureContext();
    assert(curCtx !== undefined);

    let newStatus = curCtx.status;
    try {
      this.screenRecorder.finish(curCtx);
      newStatus = CaptureStatus.FINISHED;
    } catch (e) {
      newStatus = CaptureStatus.ERROR;
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
