import path from 'path';

import { getNowAsYYYYMMDDHHmmss, getTimeInSeconds } from '@utils/date';

import {
  CaptureMode,
  type AudioSource,
  type OutputFormat,
} from '@domain/models/common';
import type { Preferences } from '@domain/models/preferences';
import type { Bounds } from '@domain/models/screen';

export type CaptureTarget = {
  mode: CaptureMode;
  bounds?: Bounds;
  screenId?: number;
};

export type RecordOptions = {
  outputAsGif: boolean;
  recordAudio: boolean;
  audioSources: AudioSource[];
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
    public recordAudio: boolean,
    public audioSources: AudioSource[],
  ) {
    this.createdAt = getTimeInSeconds();
  }

  finishCapture(): void {
    this.finishedAt = getTimeInSeconds();
  }

  static create(
    prefs: Preferences,
    target: CaptureTarget,
    recordOptions: RecordOptions,
  ): CaptureContext {
    const fileName = getNowAsYYYYMMDDHHmmss();
    const output = path.join(
      prefs.recordHome,
      `${fileName}.${prefs.outputFormat}`,
    );

    return new CaptureContext(
      target,
      output,
      recordOptions.outputAsGif ? 'gif' : 'mp4',
      recordOptions.recordAudio,
      recordOptions.audioSources,
    );
  }
}
