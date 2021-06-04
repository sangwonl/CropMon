/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IScreenInfo } from '@core/entities/screen';
import { IPreferences } from '@core/entities/preferences';

import {
  IChooseRecordHomeDirPayload,
  IClosePreferencesPayload,
  IFinishAreaSelection,
  IStartAreaSelection,
  IUiState,
} from './types';

const initialState: IUiState = {
  preferencesWindow: {
    show: false,
    preferences: {
      version: '',
      recordHomeDir: '',
      openRecordHomeDirWhenRecordCompleted: true,
    },
  },
  overlaysWindows: {},
  captureArea: {
    screenIdOnSelection: undefined,
    selectedBounds: undefined,
    isRecording: false,
  },
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    checkForUpdates: (_state) => {},
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
      const { preferences } = state.preferencesWindow;
      state.preferencesWindow.preferences.openRecordHomeDirWhenRecordCompleted =
        !preferences.openRecordHomeDirWhenRecordCompleted;
    },
    enableAreaSelection: (state) => {},
    didEnableAreaSelection: (
      state,
      action: PayloadAction<Array<IScreenInfo>>
    ) => {
      state.captureArea.screenIdOnSelection = undefined;
      state.captureArea.selectedBounds = undefined;

      action.payload.forEach((screenInfo) => {
        state.overlaysWindows[screenInfo.id] = { show: true, screenInfo };
      });
    },
    startAreaSelection: (state, action: PayloadAction<IStartAreaSelection>) => {
      state.captureArea.screenIdOnSelection = action.payload.screenId;
      state.captureArea.selectedBounds = undefined;
    },
    finishAreaSelection: (
      state,
      action: PayloadAction<IFinishAreaSelection>
    ) => {
      state.captureArea.selectedBounds = action.payload.bounds;
    },
    disableAreaSelection: (_state) => {},
    didDisableAreaSelection: (state) => {
      state.captureArea.screenIdOnSelection = undefined;
      state.captureArea.selectedBounds = undefined;
      state.captureArea.isRecording = false;

      Object.keys(state.overlaysWindows).forEach((k) => {
        // https://stackoverflow.com/questions/14667713/how-to-convert-a-string-to-number-in-typescript
        const screenId: number = +k;
        state.overlaysWindows[screenId].show = false;
      });
    },
    enableRecording: (state) => {
      state.captureArea.isRecording = true;
    },
    quitApplication: (_state) => {},
  },
});

export const {
  checkForUpdates,
  loadPreferences,
  didLoadPreferences,
  openPreferences,
  didOpenPreferences,
  closePreferences,
  didClosePreferences,
  toggleOpenRecordHomeDir,
  chooseRecordHomeDir,
  didChooseRecordHomeDir,
  enableAreaSelection,
  didEnableAreaSelection,
  startAreaSelection,
  finishAreaSelection,
  disableAreaSelection,
  didDisableAreaSelection,
  enableRecording,
  quitApplication,
} = slice.actions;

export default slice.reducer;
