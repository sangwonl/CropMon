/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import assert from 'assert';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types';

import { CaptureStatus, CaptureContext, CaptureOption } from '@core/entities';
import { GlobalRegistry, ScreenRecorder } from '@core/components';

@injectable()
export class CaptureUseCase {
  public constructor(
    private globalRegistry: GlobalRegistry,
    @inject(TYPES.ScreenRecorder) private screenRecorder: ScreenRecorder
  ) {}

  public startCapture(option: CaptureOption): CaptureContext | never {
    const ctx = new CaptureContext(option);
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

  public finishCapture(): CaptureContext | never {
    const curCtx = this.globalRegistry.getCaptureContext();
    assert(curCtx !== undefined);

    try {
      this.screenRecorder.finish(curCtx);
      curCtx.status = CaptureStatus.FINISHED;
    } catch (e) {
      curCtx.status = CaptureStatus.ERROR;
    }

    return curCtx;
  }
}
