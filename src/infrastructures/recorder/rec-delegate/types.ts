import { CaptureMode, OutputFormat } from '@core/entities/common';
import { IBounds, IScreen } from '@core/entities/screen';

export interface ITargetSlice {
  screen: IScreen; // based origin (0, 0)
  bounds: IBounds; // intersected bounds only in this screen
}

export interface IRecordContext {
  captureMode: CaptureMode;
  targetSlices: ITargetSlice[];
  targetBounds: IBounds;
  targetScreenId?: number;
  outputFormat: OutputFormat;
  recordMicrophone: boolean;
  frameRate: number;
  scaleDownFactor: number;
  videoBitrates?: number;
}
