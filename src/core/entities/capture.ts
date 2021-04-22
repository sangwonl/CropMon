/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/lines-between-class-members */

import assert from 'assert';

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
  screenIndex: number;

  constructor(mode: CaptureMode, screenIdx: number) {
    this.mode = mode;
    this.screenIndex = screenIdx;
  }
}

export interface CaptureOption {
  mode: CaptureMode;
  screenIndex: number;
}

export class CaptureContext {
  target: CaptureTarget;
  status: CaptureStatus;
  createdAt: Date;

  private constructor(option: CaptureOption) {
    assert(option.mode === CaptureMode.FULLSCREEN);
    this.target = new CaptureTarget(option.mode, option.screenIndex);
    this.status = CaptureStatus.PREPARED;
    this.createdAt = new Date();
  }

  static create(option: CaptureOption): CaptureContext {
    return new CaptureContext(option);
  }
}
