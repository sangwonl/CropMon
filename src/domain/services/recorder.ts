import { CaptureContext, Progress } from '@domain/models/capture';

export interface ScreenRecorder {
  record(ctx: CaptureContext): Promise<void>;
  finish(
    ctx: CaptureContext,
    onRecordDone: () => void,
    onPostProgress: (progres: Progress) => void
  ): Promise<void>;
  abortPostProcess(): void;
}
