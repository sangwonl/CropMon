import { IPreferences, DEFAULT_APPEAR_COLORS } from './preferences';
import { IBounds } from './screen';

export interface IPreferencesModal {
  show: boolean;
  preferences: IPreferences;
}

export interface ISelectedArea {
  bounds: IBounds;
}

export interface ICaptureOverlay {
  show: boolean;
  bounds: IBounds | null;
  showCountdown: boolean;
}

export interface ICaptureArea {
  selectedBounds: IBounds | null;
  isSelecting: boolean;
  isRecording: boolean;
}

export interface ICaptureAreaColors {
  selectingBackground: string;
  selectingText: string;
  countdownBackground: string;
  countdownText: string;
}

export interface IUiState {
  captureOverlay: ICaptureOverlay;
  captureArea: ICaptureArea;
  captureAreaColors: ICaptureAreaColors;
}

export const INITIAL_UI_STATE: IUiState = {
  captureOverlay: {
    show: false,
    bounds: null,
    showCountdown: true,
  },
  captureArea: {
    selectedBounds: null,
    isSelecting: false,
    isRecording: false,
  },
  captureAreaColors: DEFAULT_APPEAR_COLORS,
};
