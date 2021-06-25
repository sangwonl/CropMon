import { IPreferences } from './preferences';
import { IBounds, IScreenInfo } from './screen';

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

export interface IStartAreaSelection {
  screenId: number;
}

export interface IFinishAreaSelection {
  bounds: IBounds;
}

export interface IUiState {
  preferencesModal: IPreferencesModal;
  captureOverlays: ICaptureOverlays;
  captureArea: ICaptureArea;
}

export const initialUiState: IUiState = {
  preferencesModal: {
    show: false,
    preferences: {
      version: '',
      recordHomeDir: '',
      openRecordHomeWhenRecordCompleted: true,
      shortcut: '',
    },
  },
  captureOverlays: {},
  captureArea: {
    screenIdOnSelection: undefined,
    selectedBounds: undefined,
    isRecording: false,
  },
};
