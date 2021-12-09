import { CaptureMode } from '@core/entities/common';
import {
  IPreferences,
  DEFAULT_APPEAR_COLORS,
} from '@core/entities/preferences';
import { IBounds } from '@core/entities/screen';

export interface IPreferencesModal {
  show: boolean;
  preferences: IPreferences;
}

export interface IControlPanel {
  captureMode: CaptureMode;
  lowQualityMode: boolean;
  recordMicrophone: boolean;
  outputAsGif: boolean;
}

export interface ICaptureOverlay {
  show: boolean;
  showCountdown: boolean;
  bounds: IBounds | null;
  selectedBounds: IBounds | null;
  selectedScreenId: number | null;
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
  controlPanel: IControlPanel;
  captureOverlay: ICaptureOverlay;
  captureAreaColors: ICaptureAreaColors;
}

export const INITIAL_UI_STATE: IUiState = {
  controlPanel: {
    captureMode: CaptureMode.AREA,
    lowQualityMode: false,
    recordMicrophone: false,
    outputAsGif: false,
  },
  captureOverlay: {
    show: false,
    showCountdown: true,
    bounds: null,
    selectedBounds: null,
    selectedScreenId: null,
    isSelecting: false,
    isRecording: false,
  },
  captureAreaColors: DEFAULT_APPEAR_COLORS,
};
