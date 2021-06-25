/* eslint-disable @typescript-eslint/no-empty-interface */

import { IBounds } from '@core/entities/screen';

export interface IChooseRecordHomePayload {
  recordHomeDir: string;
}

export interface IClosePreferencesPayload {
  shouldSave: boolean;
}

export interface IStartCapturePayload {
  screenId: number;
  bounds?: IBounds | undefined;
}
