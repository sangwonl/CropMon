import { CaptureMode } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';
import { Preferences, DEFAULT_APPEAR_COLORS } from '@domain/models/preferences';

export interface PreferencesModal {
  show: boolean;
  preferences: Preferences;
}

export interface ControlPanel {
  captureMode: CaptureMode;
  outputAsGif: boolean;
  lowQualityMode: boolean;
  microphone: boolean;
  confirmedToCaptureAsIs: boolean;
}

export interface CaptureOverlay {
  show: boolean;
  showCountdown: boolean;
  isRecording: boolean;
  isCountingDown: boolean;
  screenBounds: { [screenId: string]: Bounds };
  selectingBounds?: Bounds;
  selectedBounds?: Bounds;
  selectedScreenId?: number;
}

export interface CaptureAreaColors {
  selectingBackground: string;
  selectingText: string;
  countdownBackground: string;
  countdownText: string;
}

export interface UiState {
  controlPanel: ControlPanel;
  captureOverlay: CaptureOverlay;
  captureAreaColors: CaptureAreaColors;
}

export const INITIAL_UI_STATE: UiState = {
  controlPanel: {
    captureMode: CaptureMode.AREA,
    lowQualityMode: false,
    microphone: false,
    outputAsGif: false,
    confirmedToCaptureAsIs: false,
  },
  captureOverlay: {
    show: false,
    showCountdown: true,
    isRecording: false,
    isCountingDown: false,
    screenBounds: {},
    selectingBounds: undefined,
    selectedBounds: undefined,
    selectedScreenId: undefined,
  },
  captureAreaColors: DEFAULT_APPEAR_COLORS,
};
