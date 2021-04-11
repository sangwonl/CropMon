export interface CaptureContextDto {
  sessionId: string;
}

export interface CaptureState {
  curCaptureCtx: CaptureContextDto | undefined;
}
