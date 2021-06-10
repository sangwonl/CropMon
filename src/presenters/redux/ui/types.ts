/* eslint-disable @typescript-eslint/no-empty-interface */

import { IPreferences } from '@core/entities/preferences';
import { IBounds, IScreenInfo } from '@core/entities/screen';

export interface IPreferencesModal {
  show: boolean;
  preferences: IPreferences;
}

export interface ICaptureOverlay {
  show: boolean;
  screenInfo: IScreenInfo;
}

export interface ICaptureOverlays {
  [screenId: number]: ICaptureOverlay;
}

export interface ICaptureArea {
  screenIdOnSelection: number | undefined;
  selectedBounds: IBounds | undefined;
  isRecording: boolean;
}

export interface IUiState {
  preferencesModal: IPreferencesModal;
  captureOverlays: ICaptureOverlays;
  captureArea: ICaptureArea;
}

export interface IChooseRecordHomeDirPayload {
  recordHomeDir: string;
}

export interface IClosePreferencesPayload {
  shouldSave: boolean;
}

export interface IStartAreaSelection {
  screenId: number;
}

export interface IFinishAreaSelection {
  bounds: IBounds;
}
