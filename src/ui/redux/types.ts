/* eslint-disable @typescript-eslint/no-empty-interface */

import { IBounds } from '@core/entities/screen';

export interface IStartCapturePayload {
  screenId: number;
  bounds?: IBounds | undefined;
}
