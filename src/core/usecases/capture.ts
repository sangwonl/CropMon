/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';

import {
  CaptureContext,
  CaptureOption,
  CaptureMode,
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
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);

    const option = new CaptureOption(CaptureMode.FULLSCREEN);

    const newCtx = CaptureContext.create(option);

    this.globalRegistry.setContext(newCtx);

    return newCtx;
  }

  public startCapture() {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);
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
