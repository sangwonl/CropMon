/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  initialUiState,
  IFinishAreaSelection,
  IStartAreaSelection,
  IUiState,
} from '@core/entities/ui';

import { IStartCapturePayload } from './types';

const slice = createSlice({
  name: 'ui',
  initialState: { root: initialUiState },
  reducers: {
    updateUiState: (s, a: PayloadAction<IUiState>) => {
      s.root = a.payload;
    },

    // app
    checkForUpdates: () => {},
    showAbout: () => {},
    quitApplication: () => {},

    // capture
    enableCaptureMode: () => {},
    disableCaptureMode: () => {},
    startAreaSelection: (_s, _a: PayloadAction<IStartAreaSelection>) => {},
    finishAreaSelection: (_s, _a: PayloadAction<IFinishAreaSelection>) => {},
    startCapture: (_s, _a: PayloadAction<IStartCapturePayload>) => {},
    finishCapture: () => {},

    // preferences
    openPreferences: () => {},
  },
});

export const {
  updateUiState,
  checkForUpdates,
  showAbout,
  openPreferences,
  quitApplication,
  enableCaptureMode,
  disableCaptureMode,
  startAreaSelection,
  finishAreaSelection,
  startCapture,
  finishCapture,
} = slice.actions;

export default slice.reducer;
