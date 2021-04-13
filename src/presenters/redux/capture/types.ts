export interface ICaptureContext {
  status: number;
  createdAt: number;
}

export interface CaptureState {
  curCaptureCtx: ICaptureContext | undefined;
}
