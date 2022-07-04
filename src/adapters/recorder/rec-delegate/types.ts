import { CaptureMode, OutputFormat } from '@domain/models/common';
import { Bounds, Screen } from '@domain/models/screen';

export interface TargetSlice {
  targetBounds: Bounds;
  screenBounds: Bounds;
  mediaSourceId: string;
}

export interface IRecordContext {
  captureMode: CaptureMode;
  targetSlices: TargetSlice[];
  outputFormat: OutputFormat;
  recordMicrophone: boolean;
  frameRate: number;
  scaleDownFactor: number;
  videoBitrates?: number;
}
