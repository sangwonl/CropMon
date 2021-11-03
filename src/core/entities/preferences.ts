export type RecordQualityMode = 'low' | 'normal';
export type OutputFormat = 'mp4' | 'webm' | 'gif';

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
  colors: IAppearancesColors;
}

export const DEFAULT_APPEAR_COLORS: IAppearancesColors = {
  selectingBackground: '#3b9f3d33',
  selectingText: '#cccccc',
  countdownBackground: '#3b9f3d33',
  countdownText: '#eeeeee',
};
