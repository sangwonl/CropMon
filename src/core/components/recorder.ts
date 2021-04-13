/* eslint-disable import/prefer-default-export */

import { CaptureContext } from '../entities/capture';

export interface ScreenRecorder {
  record(ctx: CaptureContext): Promise<void>;
}
