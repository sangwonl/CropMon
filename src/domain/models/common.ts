export enum CaptureStatus {
  IN_IDLE = 1,
  IN_SELECTING,
  PREPARED,
  IN_PROGRESS,
  FINISHED,
  ERROR,
}

export enum CaptureMode {
  AREA = 'area',
  WINDOW = 'window',
  SCREEN = 'screen',
}

export type RecordQualityMode = 'low' | 'normal';

export type OutputFormat = 'mp4' | 'webm' | 'gif';
