import { injectable } from 'inversify';
import path from 'path';

import { CaptureStatus } from '@domain/models/common';
import { CaptureContext, CaptureOptions } from '@domain/models/capture';
import { Preferences } from '@domain/models/preferences';

import { getNowAsYYYYMMDDHHmmss, getTimeInSeconds } from '@utils/date';

@injectable()
export default class CaptureSession {
  private curCaptureOptions?: CaptureOptions;
  private curCaptureCtx?: CaptureContext;

  prepareCaptureOptions(captureOptions: CaptureOptions): void {
    this.curCaptureOptions = captureOptions;
  }

  getCurCaptureOptions(): CaptureOptions | undefined {
    return this.curCaptureOptions;
  }

  createCaptureContext(
    options: CaptureOptions,
    prefs: Preferences
  ): CaptureContext {
    const fileName = getNowAsYYYYMMDDHHmmss();
    const output = path.join(
      prefs.recordHome,
      `${fileName}.${prefs.outputFormat}`
    );

    const newCaptureCtx: CaptureContext = {
      target: options.target,
      status: CaptureStatus.PREPARED,
      createdAt: getTimeInSeconds(),
      outputPath: output,
      outputFormat: options.recordOptions.enableOutputAsGif ? 'gif' : 'mp4',
      lowQualityMode: options.recordOptions.enableLowQualityMode ?? false,
      recordMicrophone: options.recordOptions.enableMicrophone ?? false,
    };

    this.curCaptureCtx = newCaptureCtx;

    return newCaptureCtx;
  }

  getCurCaptureContext(): CaptureContext | undefined {
    return this.curCaptureCtx;
  }

  updateCurCaptureContext(captureCtx: CaptureContext): void {
    this.curCaptureCtx = captureCtx;
  }
}
