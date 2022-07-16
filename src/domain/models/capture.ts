import path from 'path';
import { getNowAsYYYYMMDDHHmmss, getTimeInSeconds } from '@utils/date';

import {
  CaptureMode,
  CaptureStatus,
  OutputFormat,
} from '@domain/models/common';
import { Bounds } from '@domain/models/screen';
import { Preferences } from '@domain/models/preferences';

export type CaptureTarget = {
  mode: CaptureMode;
  bounds?: Bounds;
  screenId?: number;
};

export type RecordOptions = {
  enableOutputAsGif?: boolean;
  enableLowQualityMode?: boolean;
  enableMicrophone?: boolean;
};

export type CaptureOptions = {
  target: CaptureTarget;
  recordOptions: RecordOptions;
};

export class CaptureContext {
  private status: CaptureStatus;

  createdAt: number;
  finishedAt?: number;

  private constructor(
    public target: CaptureTarget,
    public outputPath: string,
    public outputFormat: OutputFormat,
    public lowQualityMode: boolean,
    public recordMicrophone: boolean
  ) {
    this.status = CaptureStatus.PREPARED;
    this.createdAt = getTimeInSeconds();
  }

  get isInProgress(): boolean {
    return this.status === CaptureStatus.IN_PROGRESS;
  }

  get isFinished(): boolean {
    return this.status === CaptureStatus.FINISHED;
  }

  get isError(): boolean {
    return this.status === CaptureStatus.ERROR;
  }

  setToInProgress(): void {
    this.status = CaptureStatus.IN_PROGRESS;
  }

  setToFinished(): void {
    this.status = CaptureStatus.FINISHED;
    this.finishedAt = getTimeInSeconds();
  }

  setToError(): void {
    this.status = CaptureStatus.ERROR;
  }

  static create(
    prefs: Preferences,
    target: CaptureTarget,
    recordOptions: RecordOptions
  ): CaptureContext {
    const fileName = getNowAsYYYYMMDDHHmmss();
    const output = path.join(
      prefs.recordHome,
      `${fileName}.${prefs.outputFormat}`
    );

    return new CaptureContext(
      target,
      output,
      recordOptions.enableOutputAsGif ? 'gif' : 'mp4',
      recordOptions.enableLowQualityMode ?? false,
      recordOptions.enableMicrophone ?? false
    );
  }
}
