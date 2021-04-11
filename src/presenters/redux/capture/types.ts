export interface ICaptureContext {
  createdAt: Date;
}

export interface CaptureState {
  curCaptureCtx: ICaptureContext | undefined;
}
