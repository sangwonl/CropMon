import { IBounds } from './screen';
import { OutputFormat } from './preferences';

export enum CaptureMode {
  AREA = 1,
  WINDOW,
  FULLSCREEN,
}

export enum CaptureStatus {
  PREPARED = 1,
  IN_PROGRESS,
  FINISHED,
  ERROR,
}

export interface ICaptureTarget {
  mode: CaptureMode;
  bounds?: IBounds;
  screenId?: number;
}

export interface IRecordOptions {
  enableLowQualityMode?: boolean;
  enableRecordMicrophone?: boolean;
  enableOutputAsGif?: boolean;
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
