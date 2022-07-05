import { CaptureMode } from '@domain/models/common';
import { Screen, Bounds, Point } from '@domain/models/screen';
import { Preferences, DEFAULT_APPEAR_COLORS } from '@domain/models/preferences';

export interface PreferencesModal {
  show: boolean;
  preferences: Preferences;
}

export interface ControlPanel {
  show: boolean;
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
  screens: { [screenId: string]: Screen };
  selectingBounds?: Bounds;
  selectedBounds?: Bounds;
  selectedScreenId?: number;
  startCursorPosition?: Point;
  curCursorPosition?: Point;
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
    show: false,
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
    screens: {},
    selectingBounds: undefined,
    selectedBounds: undefined,
    selectedScreenId: undefined,
    startCursorPosition: undefined,
    curCursorPosition: undefined,
  },
  captureAreaColors: DEFAULT_APPEAR_COLORS,
};
