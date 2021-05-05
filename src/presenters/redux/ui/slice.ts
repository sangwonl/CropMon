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
    screenIdOnSelection: undefined,
    selectedBounds: undefined,
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
    enableCaptureAreaSelection: (state) => {
      state.captureArea.screenIdOnSelection = undefined;
      state.captureArea.selectedBounds = undefined;
    },
    didEnableCaptureAreaSelection: (
      state,
      action: PayloadAction<Array<IScreenInfo>>
    ) => {
      action.payload.forEach((screenInfo) => {
        state.overlaysWindows[screenInfo.id] = { show: true, screenInfo };
      });
    },
    disableCaptureAreaSelection: (state) => {
      Object.keys(state.overlaysWindows).forEach((k) => {
        // https://stackoverflow.com/questions/14667713/how-to-convert-a-string-to-number-in-typescript
        const screenId: number = +k;
        state.overlaysWindows[screenId].show = false;
      });
    },
    didDisableCaptureAreaSelection: (_state) => {},
    startCaptureAreaSelection: (
      state,
      action: PayloadAction<IStartCaptureAreaSelection>
    ) => {
      state.captureArea.screenIdOnSelection = action.payload.screenId;
      state.captureArea.selectedBounds = undefined;
    },
    finishCaptureAreaSelection: (
      state,
      action: PayloadAction<IFinishCaptureAreaSelection>
    ) => {
      state.captureArea.selectedBounds = action.payload.bounds;
    },
    cancelCaptureAreaSelection: (state) => {
      state.captureArea.screenIdOnSelection = undefined;
      state.captureArea.selectedBounds = undefined;
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
  enableCaptureAreaSelection,
  didEnableCaptureAreaSelection,
  disableCaptureAreaSelection,
  didDisableCaptureAreaSelection,
  startCaptureAreaSelection,
  finishCaptureAreaSelection,
  cancelCaptureAreaSelection,
  quitApplication,
} = slice.actions;

export default slice.reducer;
