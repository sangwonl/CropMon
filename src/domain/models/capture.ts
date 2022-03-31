import {
  CaptureMode,
  CaptureStatus,
  OutputFormat,
} from '@domain/models/common';
import { Bounds } from '@domain/models/screen';

export interface CaptureTarget {
  mode: CaptureMode;
  bounds?: Bounds;
  screenId?: number;
}

export interface RecordOptions {
  enableOutputAsGif?: boolean;
  enableLowQualityMode?: boolean;
  enableMicrophone?: boolean;
}

export interface CaptureOptions {
  target: CaptureTarget;
  recordOptions: RecordOptions;
}

export interface CaptureContext {
  target: CaptureTarget;
  status: CaptureStatus;
  createdAt: number;
  finishedAt?: number;
  outputPath: string;
  outputFormat: OutputFormat;
  lowQualityMode: boolean;
  recordMicrophone: boolean;
}
