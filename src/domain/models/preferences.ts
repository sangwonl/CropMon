import { CaptureMode, OutputFormat } from '@domain/models/common';

export type AppearancesColors = {
  selectingBackground: string;
  selectingText: string;
  countdownBackground: string;
  countdownText: string;
};

export type Preferences = {
  initialLoaded: boolean;
  version: string;
  runAtStartup: boolean;
  shortcut: string;
  recordHome: string;
  openRecordHomeWhenRecordCompleted: boolean;
  showCountdown: boolean;
  recordMicrophone: boolean;
  outputFormat: OutputFormat;
  captureMode: CaptureMode;
  colors: AppearancesColors;
};

export const DEFAULT_APPEAR_COLORS: AppearancesColors = {
  selectingBackground: '#3B9F3D',
  selectingText: '#EFEFEF',
  countdownBackground: '#3B9F3D',
  countdownText: '#EFEFEF',
};
