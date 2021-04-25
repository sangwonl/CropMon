/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { CaptureContext } from '@core/entities/capture';
import { Preferences } from '@core/entities';

@injectable()
export class GlobalRegistry {
  private curCaptureContext: CaptureContext | undefined;
  private userPreferences: Preferences | undefined;

  setCaptureContext(ctx: CaptureContext) {
    this.curCaptureContext = ctx;
  }

  getCaptureContext(): CaptureContext | undefined {
    return this.curCaptureContext;
  }

  setUserPreferences(pref: Preferences) {
    this.userPreferences = pref;
  }

  getUserPreferences(): Preferences | undefined {
    return this.userPreferences;
  }
}
