/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import assert from 'assert';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';

import {
  CaptureStatus,
  CaptureContext,
  CaptureOption,
} from '../entities/capture';

import { GlobalRegistry } from '../components/registry';
import { ScreenRecorder } from '../components';

@injectable()
export class CaptureUseCase {
  public constructor(
    private globalRegistry: GlobalRegistry,
    @inject(TYPES.ScreenRecorder) private screenRecorder: ScreenRecorder
  ) {}

  public prepareCapture(option: CaptureOption): CaptureContext | never {
    const newCtx = CaptureContext.create(option);

    this.globalRegistry.setContext(newCtx);

    return newCtx;
  }

  public startCapture(): CaptureContext | never {
    const curCtx = this.globalRegistry.currentContext();
    assert(curCtx !== undefined);

    try {
      this.screenRecorder.record(curCtx);
      curCtx.status = CaptureStatus.IN_PROGRESS;
    } catch (e) {
      curCtx.status = CaptureStatus.ERROR;
    }

    return curCtx;
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
    const curCtx = this.globalRegistry.currentContext();
    assert(curCtx !== undefined);

    this.screenRecorder.finish(curCtx);

    return curCtx;
  }
}
