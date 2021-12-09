import {
  CaptureMode,
  CaptureStatus,
  OutputFormat,
} from '@core/entities/common';
import { IBounds } from '@core/entities/screen';

export interface ICaptureTarget {
  mode: CaptureMode;
  bounds?: IBounds;
  screenId?: number;
}

export interface IRecordOptions {
  enableLowQualityMode: boolean;
  enableRecordMicrophone: boolean;
  enableOutputAsGif: boolean;
}

export interface ICaptureOptions {
  target: ICaptureTarget;
  recordOptions: IRecordOptions;
}

export interface ICaptureContext {
  target: ICaptureTarget;
  status: CaptureStatus;
  createdAt: number;
  finishedAt?: number;
  outputPath?: string;
  outputFormat: OutputFormat;
  lowQualityMode: boolean;
  recordMicrophone: boolean;
}
