import { CaptureContext } from '@domain/models/capture';

export interface ScreenRecorder {
  record(ctx: CaptureContext): Promise<void>;
  finish(ctx: CaptureContext): Promise<void>;
}
