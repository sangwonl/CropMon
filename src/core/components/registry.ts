/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { CaptureContext } from '../entities/capture';

@injectable()
export class GlobalRegistry {
  private currentCaptureContext: CaptureContext | undefined;

  setContext(ctx: CaptureContext) {
    this.currentCaptureContext = ctx;
  }

  currentContext(): CaptureContext | undefined {
    return this.currentCaptureContext;
  }
}
