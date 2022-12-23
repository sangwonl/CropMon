import { CaptureContext } from '@domain/models/capture';
import { AudioSource } from '@domain/models/common';
import { Progress } from '@domain/models/ui';

export interface ScreenRecorder {
  record(ctx: CaptureContext): Promise<void>;
  finish(
    ctx: CaptureContext,
    onRecordDone: () => void,
    onPostProgress: (progres: Progress) => void
  ): Promise<void>;
  abortPostProcess(): void;
}

export interface RecorderSource {
  fetchAudioSources(): Promise<AudioSource[]>;
}
