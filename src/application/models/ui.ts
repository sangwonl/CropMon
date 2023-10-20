import {
  CaptureMode,
  type AudioSource,
  OutputFormat,
} from '@domain/models/common';
import {
  DEFAULT_APPEAR_COLORS,
  type Preferences,
} from '@domain/models/preferences';
import type { Screen, Bounds, Point } from '@domain/models/screen';

export type PreferencesModal = {
  show: boolean;
  preferences: Preferences;
};

export type ControlPanel = {
  show: boolean;
  captureMode: CaptureMode;
  outputFormat: OutputFormat;
  recordAudio: boolean;
  audioSources: AudioSource[];
  confirmedToCaptureAsIs: boolean;
};

export type CaptureOverlay = {
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
};

export type CaptureAreaColors = {
  selectingBackground: string;
  selectingText: string;
  countdownBackground: string;
  countdownText: string;
};

export type UiState = {
  controlPanel: ControlPanel;
  captureOverlay: CaptureOverlay;
  captureAreaColors: CaptureAreaColors;
};

export const INITIAL_UI_STATE: UiState = {
  controlPanel: {
    show: false,
    captureMode: CaptureMode.AREA,
    audioSources: [],
    outputFormat: 'mp4',
    recordAudio: false,
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
