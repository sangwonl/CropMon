/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/lines-between-class-members */

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
  screenId: number;
  bounds?: IBounds;
}

export interface ICaptureOption {
  mode: CaptureMode;
  screenId: number;
  bounds?: IBounds;
}

export interface ICaptureContext {
  target: ICaptureTarget;
  status: CaptureStatus;
  createdAt: number;
  outputPath?: string;
}

export const createCaptureContext = (
  option: ICaptureOption
): ICaptureContext => {
  const { mode, screenId, bounds } = option;
  return {
    target: { mode, screenId, bounds },
    status: CaptureStatus.PREPARED,
    createdAt: dayjs().second(),
  };
};
