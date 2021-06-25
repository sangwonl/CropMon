/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IPreferences } from '@core/entities/preferences';
import {
  initialUiState,
  IFinishAreaSelection,
  IStartAreaSelection,
  IUiState,
} from '@core/entities/ui';

import {
  IChooseRecordHomeDirPayload as IChooseRecordHomePayload,
  IClosePreferencesPayload,
  IStartCapturePayload,
} from './types';

const slice = createSlice({
  name: 'ui',
  initialState: initialUiState,
  reducers: {
    // app
    checkForUpdates: (_s) => {},
    showAbout: (_s) => {},

    // capture
    updateUiState: (s, { payload }: PayloadAction<IUiState>) => {
      s.captureArea = payload.captureArea;
      s.captureOverlays = payload.captureOverlays;
      s.preferencesModal = payload.preferencesModal;
    },
    enableCaptureMode: (_s) => {},
    disableCaptureMode: (_s) => {},
    startAreaSelection: (_s, _a: PayloadAction<IStartAreaSelection>) => {},
    finishAreaSelection: (_s, _a: PayloadAction<IFinishAreaSelection>) => {},
    startCapture: (_s, _a: PayloadAction<IStartCapturePayload>) => {},
    finishCapture: (_s) => {},

    // legacy
    loadPreferences: (_s) => {},
    didLoadPreferences: (s, a: PayloadAction<IPreferences>) => {
      s.preferencesModal.preferences = a.payload;
    },
    openPreferences: (_s) => {},
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
    chooseRecordHomeDir: (_s) => {},
    didChooseRecordHomeDir: (s, a: PayloadAction<IChooseRecordHomePayload>) => {
      s.preferencesModal.preferences.recordHomeDir = a.payload.recordHomeDir;
    },
    setFlagToOpenRecordHomeDir: (s, a: PayloadAction<boolean>) => {
      s.preferencesModal.preferences.openRecordHomeWhenRecordCompleted =
        a.payload;
    },
    setShortcut: (s, a: PayloadAction<string>) => {
      s.preferencesModal.preferences.shortcut = a.payload;
    },
    quitApplication: (_s) => {},
  },
});

export const {
  updateUiState,
  enableCaptureMode,
  disableCaptureMode,
  startAreaSelection,
  finishAreaSelection,
  startCapture,
  finishCapture,

  showAbout,
  checkForUpdates,
  loadPreferences,
  didLoadPreferences,
  openPreferences,
  didOpenPreferences,
  closePreferences,
  didClosePreferences,
  setFlagToOpenRecordHomeDir,
  setShortcut,
  chooseRecordHomeDir,
  didChooseRecordHomeDir,
  quitApplication,
} = slice.actions;

export default slice.reducer;
