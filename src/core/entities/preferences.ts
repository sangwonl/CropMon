export type RecordQualityMode = 'low' | 'normal';
export type OutputFormat = 'mp4' | 'webm' | 'gif';

export interface IPreferences {
  initialLoaded: boolean;
  version: string;
  runAtStartup: boolean;
  shortcut: string;
  openRecordHomeWhenRecordCompleted: boolean;
  recordHome: string;
  recordMicrophone: boolean;
  recordQualityMode: RecordQualityMode;
  outputFormat: OutputFormat;
}
