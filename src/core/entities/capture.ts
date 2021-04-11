/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/lines-between-class-members */

import { assert } from 'console';

export enum CaptureMode {
  AREA = 1,
  WINDOW,
  FULLSCREEN,
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
  createdAt: Date;

  target: CaptureTarget;

  private constructor(option: CaptureOption) {
    this.createdAt = new Date();

    assert(option.mode === CaptureMode.FULLSCREEN);
    this.target = new CaptureTarget(option.mode);
  }

  static create(option: CaptureOption): CaptureContext {
    return new CaptureContext(option);
  }
}
