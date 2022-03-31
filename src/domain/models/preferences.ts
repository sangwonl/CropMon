import {
  CaptureMode,
  OutputFormat,
  RecordQualityMode,
} from '@domain/models/common';

export interface AppearancesColors {
  selectingBackground: string;
  selectingText: string;
  countdownBackground: string;
  countdownText: string;
}

export interface Preferences {
  initialLoaded: boolean;
  version: string;
  runAtStartup: boolean;
  shortcut: string;
  recordHome: string;
  openRecordHomeWhenRecordCompleted: boolean;
  showCountdown: boolean;
  recordMicrophone: boolean;
  recordQualityMode: RecordQualityMode;
  outputFormat: OutputFormat;
  captureMode: CaptureMode;
  colors: AppearancesColors;
}

export const DEFAULT_APPEAR_COLORS: AppearancesColors = {
  selectingBackground: '#3B9F3D',
  selectingText: '#EFEFEF',
  countdownBackground: '#3B9F3D',
  countdownText: '#EFEFEF',
};
