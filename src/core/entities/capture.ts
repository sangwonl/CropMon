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

  constructor(mode: CaptureMode) {
    this.mode = mode;
  }
}

export class CaptureOption {
  mode: CaptureMode;

  constructor(mode: CaptureMode) {
    this.mode = mode;
  }
}

export class CaptureContext {
  target: CaptureTarget;

  status: CaptureStatus;

  createdAt: Date;

  private constructor(option: CaptureOption) {
    assert(option.mode === CaptureMode.FULLSCREEN);
    this.target = new CaptureTarget(option.mode);

    this.status = CaptureStatus.PREPARED;

    this.createdAt = new Date();
  }

  static create(option: CaptureOption): CaptureContext {
    return new CaptureContext(option);
  }
}
