/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IPreferences {
  recordHomeDir: string;
  shouldOpenRecordHomeDir: boolean;
}

export interface IPreferencesWindow {
  show: boolean;
  preferences: IPreferences;
}

export interface IScreenBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IScreenInfo {
  id: number;
  bounds: IScreenBounds;
}

export interface IOverlaysWindow {
  show: boolean;
  screenInfo: IScreenInfo;
}

export interface IOverlaysWindows {
  [screenId: number]: IOverlaysWindow;
}

export interface ICaptureArea {
  screenIdOnSelection?: number;
  selectedBounds?: IScreenBounds;
}

export interface IUiState {
  preferencesWindow: IPreferencesWindow;
  overlaysWindows: IOverlaysWindows;
  captureArea: ICaptureArea;
}

export interface IChooseRecordHomeDirPayload {
  recordHomeDir: string;
}

export interface IClosePreferencesPayload {
  shouldSave: boolean;
}

export interface IStartCaptureAreaSelection {
  screenId: number;
}

export interface IFinishCaptureAreaSelection {
  bounds: IScreenBounds;
}
