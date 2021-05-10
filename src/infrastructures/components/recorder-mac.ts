/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify';

import { IScreenRecorder } from '@core/components';
import { ICaptureContext } from '@core/entities/capture';

@injectable()
export class ScreenRecorderMac implements IScreenRecorder {
  async record(ctx: ICaptureContext): Promise<void> {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject(undefined);
  }

  async finish(ctx: ICaptureContext): Promise<void> {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject(undefined);
  }
}
