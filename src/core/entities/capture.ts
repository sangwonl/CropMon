/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/lines-between-class-members */

import assert from 'assert';
import { ScreenBounds } from './screen';

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

class CaptureTarget {
  mode: CaptureMode;
  screenId: number;
  bounds?: ScreenBounds;

  constructor(mode: CaptureMode, screenId: number, bounds?: ScreenBounds) {
    this.mode = mode;
    this.screenId = screenId;
    this.bounds = bounds;
  }
}

export interface CaptureOption {
  mode: CaptureMode;
  screenId: number;
  bounds?: ScreenBounds;
}

export class CaptureContext {
  target: CaptureTarget;
  status: CaptureStatus;
  createdAt: Date;

  constructor(option: CaptureOption) {
    this.target = new CaptureTarget(
      option.mode,
      option.screenId,
      option.bounds
    );
    this.status = CaptureStatus.PREPARED;
    this.createdAt = new Date();
  }
}
