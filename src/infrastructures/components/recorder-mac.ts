/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify';
import { ScreenRecorder } from '@core/components';
import { CaptureContext } from '@core/entities/capture';

@injectable()
export class ScreenRecorderMac implements ScreenRecorder {
  async record(ctx: CaptureContext): Promise<void> {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject(undefined);
  }

  async finish(ctx: CaptureContext): Promise<void> {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject(undefined);
  }
}
