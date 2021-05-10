/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { ICaptureContext } from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';

@injectable()
export class IGlobalRegistry {
  private curCaptureContext: ICaptureContext | undefined;
  private userPreferences: IPreferences | undefined;

  setCaptureContext(ctx: ICaptureContext) {
    this.curCaptureContext = ctx;
  }

  getCaptureContext(): ICaptureContext | undefined {
    return this.curCaptureContext;
  }

  setUserPreferences(pref: IPreferences) {
    this.userPreferences = pref;
  }

  getUserPreferences(): IPreferences | undefined {
    return this.userPreferences;
  }
}
