/* eslint-disable @typescript-eslint/no-empty-interface */

import { IScreenBounds, IScreenInfo } from '../common/types';

export interface IPreferences {
  recordHomeDir: string;
  shouldOpenRecordHomeDir: boolean;
}

export interface IPreferencesWindow {
  show: boolean;
  preferences: IPreferences;
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
