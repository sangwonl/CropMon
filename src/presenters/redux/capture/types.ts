import { ICaptureContext } from '@core/entities/capture';
import { IBounds } from '@core/entities/screen';

export interface ICaptureState {
  curCaptureCtx?: ICaptureContext | undefined;
}

export interface IStartCapturePayload {
  screenId: number;
  bounds?: IBounds | undefined;
}
