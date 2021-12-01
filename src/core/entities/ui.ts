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
  showCountdown: boolean;
  bounds: IBounds | null;
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
  captureAreaColors: ICaptureAreaColors;
}

export const INITIAL_UI_STATE: IUiState = {
  captureOverlay: {
    show: false,
    showCountdown: true,
    bounds: null,
    selectedBounds: null,
    isSelecting: false,
    isRecording: false,
  },
  captureAreaColors: DEFAULT_APPEAR_COLORS,
};
