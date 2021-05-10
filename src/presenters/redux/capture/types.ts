import { IScreenBounds } from '../common/types';

export interface ICaptureContext {
  screenId: number;
  bounds?: IScreenBounds;
  status: number;
  createdAt: number;
}

export interface ICaptureState {
  curCaptureCtx: ICaptureContext | undefined;
}

export interface IStartCapturePayload {
  screenId: number;
  bounds?: IScreenBounds;
}
