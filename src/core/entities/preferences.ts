export type RecordQualityMode = 'low' | 'normal';
export type OutputFormat = 'mp4' | 'webm' | 'gif';

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
}
