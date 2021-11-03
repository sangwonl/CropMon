/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { INITIAL_UI_STATE, ISelectedArea, IUiState } from '@core/entities/ui';
import { IRecordingOptions } from '@core/entities/capture';

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
    enableCaptureMode: () => {},
    disableCaptureMode: () => {},
    startAreaSelection: () => {},
    finishAreaSelection: (_s, _a: PayloadAction<ISelectedArea>) => {},
    startCapture: (_s, _a: PayloadAction<ISelectedArea>) => {},
    finishCapture: () => {},

    // preferences
    openPreferences: () => {},
    toggleRecOptions: (_s, _a: PayloadAction<IRecordingOptions>) => {},
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
  startAreaSelection,
  finishAreaSelection,
  startCapture,
  finishCapture,
} = slice.actions;

export default slice.reducer;
