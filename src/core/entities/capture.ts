/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/lines-between-class-members */

import path from 'path';
import dayjs from 'dayjs';

import { IBounds } from './screen';

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
}

export const createCaptureContext = (
  option: ICaptureOption,
  recordHome: string
): ICaptureContext => {
  const { mode, bounds } = option;
  const fileName = dayjs().format('YYYYMMDDHHmmss');
  return {
    target: { mode, bounds },
    status: CaptureStatus.PREPARED,
    createdAt: dayjs().second(),
    outputPath: path.join(recordHome, `${fileName}.mp4`),
  };
};
