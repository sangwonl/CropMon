/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IChooseRecordHomeDirPayload,
  IClosePreferencesPayload,
  IFinishCaptureAreaSelection,
  IOverlaysWindows,
  IPreferences,
  IScreenInfo,
  IStartCaptureAreaSelection,
  IUiState,
} from './types';

const initialState: IUiState = {
  preferencesWindow: {
    show: false,
    preferences: {
      recordHomeDir: '',
      shouldOpenRecordHomeDir: true,
    },
  },
  overlaysWindows: {},
  captureArea: {
    screenIdOnSelection: 0,
    selectedBounds: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  },
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    loadPreferences: (_state) => {},
    didLoadPreferences: (state, action: PayloadAction<IPreferences>) => {
      state.preferencesWindow.preferences = action.payload;
    },
    openPreferences: (_state) => {},
    didOpenPreferences: (state) => {
      state.preferencesWindow.show = true;
    },
    closePreferences: {
      reducer: (_state, _action: PayloadAction<IClosePreferencesPayload>) => {},
      prepare: (shouldSave?: boolean) => ({
        payload: { shouldSave: shouldSave || false },
      }),
    },
    didClosePreferences: (state) => {
      state.preferencesWindow.show = false;
    },
    chooseRecordHomeDir: (_state) => {},
    didChooseRecordHomeDir: (
      state,
      action: PayloadAction<IChooseRecordHomeDirPayload>
    ) => {
      state.preferencesWindow.preferences.recordHomeDir =
        action.payload.recordHomeDir;
    },
    toggleOpenRecordHomeDir: (state) => {
      const { shouldOpenRecordHomeDir } = state.preferencesWindow.preferences;
      state.preferencesWindow.preferences.shouldOpenRecordHomeDir = !shouldOpenRecordHomeDir;
    },
    enableCaptureSelection: (_state) => {},
    didEnableCaptureSelection: (
      state,
      action: PayloadAction<Array<IScreenInfo>>
    ) => {
      const wins: IOverlaysWindows = {};
      action.payload.forEach((screenInfo) => {
        wins[screenInfo.id] = { show: true, screenInfo };
      });
      state.overlaysWindows = wins;
    },
    startCaptureAreaSelection: (
      state,
      action: PayloadAction<IStartCaptureAreaSelection>
    ) => {
      state.captureArea.screenIdOnSelection = action.payload.screenId;
      state.captureArea.selectedBounds = { x: 0, y: 0, width: 0, height: 0 };
    },
    finishCaptureAreaSelection: (
      state,
      action: PayloadAction<IFinishCaptureAreaSelection>
    ) => {
      state.captureArea.selectedBounds = action.payload.bounds;
    },
    quitApplication: (_state) => {},
  },
});

export const {
  loadPreferences,
  didLoadPreferences,
  openPreferences,
  didOpenPreferences,
  closePreferences,
  didClosePreferences,
  toggleOpenRecordHomeDir,
  chooseRecordHomeDir,
  didChooseRecordHomeDir,
  enableCaptureSelection,
  didEnableCaptureSelection,
  startCaptureAreaSelection,
  finishCaptureAreaSelection,
  quitApplication,
} = slice.actions;

export default slice.reducer;
