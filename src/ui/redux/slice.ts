/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  initialUiState,
  IFinishAreaSelection,
  IUiState,
  IRecordingOptions,
} from '@core/entities/ui';

const slice = createSlice({
  name: 'ui',
  initialState: { root: initialUiState },
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
    finishAreaSelection: (_s, _a: PayloadAction<IFinishAreaSelection>) => {},
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
  finishCapture,
} = slice.actions;

export default slice.reducer;
