import path from 'path';

import { getNowAsYYYYMMDDHHmmss, getTimeInSeconds } from '@utils/date';

import { CaptureMode, OutputFormat } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';
import { Bounds } from '@domain/models/screen';

export type CaptureTarget = {
  mode: CaptureMode;
  bounds?: Bounds;
  screenId?: number;
};

export type RecordOptions = {
  enableOutputAsGif?: boolean;
  enableMicrophone?: boolean;
};

export type CaptureOptions = {
  target: CaptureTarget;
  recordOptions: RecordOptions;
};

export class CaptureContext {
  createdAt: number;
  finishedAt?: number;

  private constructor(
    public target: CaptureTarget,
    public outputPath: string,
    public outputFormat: OutputFormat,
    public recordMicrophone: boolean
  ) {
    this.createdAt = getTimeInSeconds();
  }

  finishCapture(): void {
    this.finishedAt = getTimeInSeconds();
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
      recordOptions.enableMicrophone ?? false
    );
  }
}
