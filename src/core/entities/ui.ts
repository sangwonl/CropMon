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
  outputAsGif: boolean;
  lowQualityMode: boolean;
  recordMicrophone: boolean;
}

export interface ICaptureOverlay {
  show: boolean;
  showCountdown: boolean;
  isSelecting: boolean;
  isRecording: boolean;
  bounds?: IBounds;
  selectedBounds?: IBounds;
  selectedScreenId?: number;
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
    isSelecting: false,
    isRecording: false,
    bounds: undefined,
    selectedBounds: undefined,
    selectedScreenId: undefined,
  },
  captureAreaColors: DEFAULT_APPEAR_COLORS,
};
