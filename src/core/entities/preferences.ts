import {
  CaptureMode,
  OutputFormat,
  RecordQualityMode,
} from '@core/entities/common';

export interface IAppearancesColors {
  selectingBackground: string;
  selectingText: string;
  countdownBackground: string;
  countdownText: string;
}

export interface IPreferences {
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
  colors: IAppearancesColors;
}

export const DEFAULT_APPEAR_COLORS: IAppearancesColors = {
  selectingBackground: '#3B9F3D',
  selectingText: '#EFEFEF',
  countdownBackground: '#3B9F3D',
  countdownText: '#EFEFEF',
};
