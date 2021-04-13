/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import assert from 'assert';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';

import {
  CaptureMode,
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

  public prepareCapture(): CaptureContext | never {
    const option = new CaptureOption(CaptureMode.FULLSCREEN);

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

  public stopCapture() {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);
  }
}
