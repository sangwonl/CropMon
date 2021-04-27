/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IPreferences {
  recordHomeDir: string;
  shouldOpenRecordHomeDir: boolean;
}

export interface IPreferencesWindow {
  show: boolean;
  preferences: IPreferences;
}

export interface IUiState {
  preferencesWindow: IPreferencesWindow;
}

export interface IChooseRecordHomeDirPayload {
  recordHomeDir: string;
}

export interface IClosePreferencesPayload {
  shouldSave: boolean;
}
