import { IPreferences } from './preferences';
import { IBounds } from './screen';

export interface IPreferencesModal {
  show: boolean;
  preferences: IPreferences;
}

export interface ICaptureOverlay {
  show: boolean;
  bounds: IBounds | undefined;
}

export interface ICaptureArea {
  selectedBounds: IBounds | undefined;
  isSelecting: boolean;
  isRecording: boolean;
}

export interface IFinishAreaSelection {
  bounds: IBounds;
}

export interface IUiState {
  captureOverlay: ICaptureOverlay;
  captureArea: ICaptureArea;
}

export const initialUiState: IUiState = {
  captureOverlay: {
    show: false,
    bounds: undefined,
  },
  captureArea: {
    selectedBounds: undefined,
    isSelecting: false,
    isRecording: false,
  },
};
