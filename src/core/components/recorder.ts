/* eslint-disable import/prefer-default-export */

import { CaptureContext } from '@core/entities/capture';

export interface ScreenRecorder {
  record(ctx: CaptureContext): Promise<void>;
  finish(ctx: CaptureContext): Promise<void>;
}
