export type RecordQualityMode = 'low' | 'normal';

export interface IPreferences {
  initialLoaded: boolean;
  version: string;
  openRecordHomeWhenRecordCompleted: boolean;
  recordHome: string;
  shortcut: string;
  runAtStartup: boolean;
  recordMicrophone: boolean;
  recordQualityMode: RecordQualityMode;
}
