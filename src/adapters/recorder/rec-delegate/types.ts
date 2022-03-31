import { CaptureMode, OutputFormat } from '@domain/models/common';
import { Bounds, Screen } from '@domain/models/screen';

export interface TargetSlice {
  screen: Screen; // based origin (0, 0)
  bounds: Bounds; // intersected bounds only in this screen
}

export interface IRecordContext {
  captureMode: CaptureMode;
  targetSlices: TargetSlice[];
  targetBounds: Bounds;
  targetScreenId?: number;
  outputFormat: OutputFormat;
  recordMicrophone: boolean;
  frameRate: number;
  scaleDownFactor: number;
  videoBitrates?: number;
}
