/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { INITIAL_UI_STATE, IUiState } from '@core/entities/ui';
import {
  CaptureMode,
  ICaptureOptions,
  IRecordOptions,
} from '@core/entities/capture';

const slice = createSlice({
  name: 'ui',
  initialState: { root: INITIAL_UI_STATE },
  reducers: {
    updateUiState: (s, a: PayloadAction<IUiState>) => {
      s.root = a.payload;
    },

    // app
    checkForUpdates: () => {},
    downloadAndInstall: () => {},
    showAbout: () => {},
    showHelp: () => {},
    quitApplication: () => {},

    // capture
    enableCaptureMode: (_s, _a: PayloadAction<CaptureMode | undefined>) => {},
    disableCaptureMode: () => {},
    startTargetSelection: () => {},
    finishTargetSelection: (_s, _a: PayloadAction<ICaptureOptions>) => {},
    startCapture: () => {},
    finishCapture: () => {},

    // preferences
    openPreferences: () => {},
    toggleRecOptions: (_s, _a: PayloadAction<IRecordOptions>) => {},
  },
});

export const {
  updateUiState,
  checkForUpdates,
  downloadAndInstall,
  showAbout,
  showHelp,
  openPreferences,
  toggleRecOptions,
  quitApplication,
  enableCaptureMode,
  disableCaptureMode,
  startTargetSelection,
  finishTargetSelection,
  startCapture,
  finishCapture,
} = slice.actions;

export default slice.reducer;
