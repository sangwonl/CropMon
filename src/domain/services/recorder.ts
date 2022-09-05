import { CaptureContext, Progress } from '@domain/models/capture';

export interface ScreenRecorder {
  record(ctx: CaptureContext): Promise<void>;
  finish(
    ctx: CaptureContext,
    onPostProgress: (progres: Progress) => void
  ): Promise<void>;
}
