/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CaptureMode } from '@core/entities/common';
import { ICaptureOptions, IRecordOptions } from '@core/entities/capture';
import { INITIAL_UI_STATE, IUiState } from '@core/entities/ui';
import { IBounds } from '@core/entities/screen';

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
    changeCaptureOptions: (_s, _a: PayloadAction<ICaptureOptions>) => {},
    startTargetSelection: () => {},
    finishTargetSelection: (_s, _a: PayloadAction<IBounds>) => {},
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
  changeCaptureOptions,
  startTargetSelection,
  finishTargetSelection,
  startCapture,
  finishCapture,
} = slice.actions;

export default slice.reducer;
