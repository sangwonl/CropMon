import { AudioSource, CaptureMode, OutputFormat } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';

export type TargetSlice = {
  targetBounds: Bounds;
  screenBounds: Bounds;
  mediaSourceId: string;
};

export type RecordContext = {
  captureMode: CaptureMode;
  targetSlices: TargetSlice[];
  outputFormat: OutputFormat;
  recordAudio: boolean;
  audioSources: AudioSource[];
  frameRate: number;
  scaleDownFactor: number;
  videoBitrates?: number;
};
