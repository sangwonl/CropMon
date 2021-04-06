/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { ScreenRecorder } from '../components';

@injectable()
export class CaptureUseCase {
  private screenRecorder: ScreenRecorder;

  public constructor(@inject(TYPES.ScreenRecorder) recorder: ScreenRecorder) {
    this.screenRecorder = recorder;
  }

  public prepareCapture() {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);
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
