import { CaptureMode, OutputFormat } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';

export type TargetSlice = {
  targetBounds: Bounds;
  screenBounds: Bounds;
  mediaSourceId: string;
};

export type IRecordContext = {
  captureMode: CaptureMode;
  targetSlices: TargetSlice[];
  outputFormat: OutputFormat;
  recordMicrophone: boolean;
  frameRate: number;
  scaleDownFactor: number;
  videoBitrates?: number;
};
