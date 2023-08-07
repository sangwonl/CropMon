import type {
  AudioSource,
  CaptureMode,
  OutputFormat,
} from '@domain/models/common';
import type { Bounds } from '@domain/models/screen';

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

export type TransformWorkerMessage = {
  type: 'pipeline';
  frameRate: number;
  boundsList: {
    srcBounds: Bounds;
    dstBounds: Bounds;
  }[];
  readables: ReadableStream<VideoFrame>[];
  nullWritables: WritableStream<VideoFrame>[];
  writable: WritableStream<VideoFrame>;
  canvas: OffscreenCanvas;
};
