import path from 'path';
import dayjs from 'dayjs';

import { IBounds } from './screen';
import { IPreferences, OutputFormat } from './preferences';

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
  bounds: IBounds | undefined;
}

export interface ICaptureOption {
  mode: CaptureMode;
  bounds: IBounds | undefined;
}

export interface ICaptureContext {
  target: ICaptureTarget;
  status: CaptureStatus;
  createdAt: number;
  outputPath: string | undefined;
  outputFormat: OutputFormat;
  lowQualityMode: boolean;
  recordMicrophone: boolean;
}

export const createCaptureContext = (
  option: ICaptureOption,
  prefs: IPreferences
): ICaptureContext => {
  const { mode, bounds } = option;
  const fileName = dayjs().format('YYYYMMDDHHmmss');
  const output = path.join(
    prefs.recordHome,
    `${fileName}.${prefs.outputFormat}`
  );

  return {
    target: { mode, bounds },
    status: CaptureStatus.PREPARED,
    createdAt: dayjs().second(),
    outputPath: output,
    outputFormat: prefs.outputFormat,
    lowQualityMode: prefs.recordQualityMode === 'low',
    recordMicrophone: prefs.recordMicrophone,
  };
};
