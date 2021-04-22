/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { CaptureContext } from '@core/entities/capture';
import { Preference } from '@core/entities';

@injectable()
export class GlobalRegistry {
  private curCaptureContext: CaptureContext | undefined;
  private userPreference: Preference | undefined;

  setCaptureContext(ctx: CaptureContext) {
    this.curCaptureContext = ctx;
  }

  getCaptureContext(): CaptureContext | undefined {
    return this.curCaptureContext;
  }

  setUserPreference(pref: Preference) {
    this.userPreference = pref;
  }

  getUserPreference(): Preference | undefined {
    return this.userPreference;
  }
}
