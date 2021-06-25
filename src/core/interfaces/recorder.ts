/* eslint-disable import/prefer-default-export */

import { ICaptureContext } from '@core/entities/capture';

export interface IScreenRecorder {
  record(ctx: ICaptureContext): Promise<void>;
  finish(ctx: ICaptureContext): Promise<void>;
}
