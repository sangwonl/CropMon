/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ScreenRecorder } from '../components';
import { CaptureContext } from '../entities/capture';

@injectable()
export class CaptureUseCase {
  public constructor(
    @inject(TYPES.ScreenRecorder) private screenRecorder: ScreenRecorder
  ) {}

  public prepareCapture(): CaptureContext | never {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);

    return new CaptureContext();
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
