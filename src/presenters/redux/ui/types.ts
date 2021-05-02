/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IPreferences {
  recordHomeDir: string;
  shouldOpenRecordHomeDir: boolean;
}

export interface IPreferencesWindow {
  show: boolean;
  preferences: IPreferences;
}

export interface IScreenInfo {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IOverlaysWindow {
  show: boolean;
  screenInfo: IScreenInfo;
}

export interface IOverlaysWindows {
  [screenId: number]: IOverlaysWindow;
}

export interface IUiState {
  preferencesWindow: IPreferencesWindow;
  overlaysWindows: IOverlaysWindows;
}

export interface IChooseRecordHomeDirPayload {
  recordHomeDir: string;
}

export interface IClosePreferencesPayload {
  shouldSave: boolean;
}
