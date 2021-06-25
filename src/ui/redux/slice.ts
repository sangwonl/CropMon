/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  initialUiState,
  IFinishAreaSelection,
  IStartAreaSelection,
  IUiState,
} from '@core/entities/ui';

import {
  IChooseRecordHomePayload,
  IClosePreferencesPayload,
  IStartCapturePayload,
} from './types';

const slice = createSlice({
  name: 'ui',
  initialState: initialUiState,
  reducers: {
    updateUiState: (s, { payload }: PayloadAction<IUiState>) => {
      s.captureArea = payload.captureArea;
      s.captureOverlays = payload.captureOverlays;
      s.preferencesModal = payload.preferencesModal;
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

    // legacy
    openPreferences: () => {},
    didOpenPreferences: (s) => {
      s.preferencesModal.show = true;
    },
    closePreferences: {
      reducer: (_s, _a: PayloadAction<IClosePreferencesPayload>) => {},
      prepare: (shouldSave?: boolean) => ({
        payload: { shouldSave: shouldSave || false },
      }),
    },
    didClosePreferences: (s) => {
      s.preferencesModal.show = false;
    },
    chooseRecordHomeDir: () => {},
    didChooseRecordHomeDir: (s, a: PayloadAction<IChooseRecordHomePayload>) => {
      s.preferencesModal.preferences.recordHome = a.payload.recordHomeDir;
    },
    setFlagToOpenRecordHomeDir: (s, a: PayloadAction<boolean>) => {
      s.preferencesModal.preferences.openRecordHomeWhenRecordCompleted =
        a.payload;
    },
    setShortcut: (s, a: PayloadAction<string>) => {
      s.preferencesModal.preferences.shortcut = a.payload;
    },
  },
});

export const {
  updateUiState,
  checkForUpdates,
  showAbout,
  quitApplication,
  enableCaptureMode,
  disableCaptureMode,
  startAreaSelection,
  finishAreaSelection,
  startCapture,
  finishCapture,
  openPreferences,
  didOpenPreferences,
  closePreferences,
  didClosePreferences,
  setFlagToOpenRecordHomeDir,
  setShortcut,
  chooseRecordHomeDir,
  didChooseRecordHomeDir,
} = slice.actions;

export default slice.reducer;
