export interface ICaptureContext {
  status: number;
  createdAt: number;
}

export interface ICaptureState {
  curCaptureCtx: ICaptureContext | undefined;
}
