/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IChooseRecordHomeDirPayload,
  IClosePreferencesPayload,
  IPreferences,
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
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    loadPreferences: (state) => {},
    didLoadPreferences: (state, action: PayloadAction<IPreferences>) => {
      state.preferencesWindow.preferences = action.payload;
    },
    openPreferences: (state) => {},
    didOpenPreferences: (state) => {
      state.preferencesWindow.show = true;
    },
    closePreferences: {
      prepare: (shouldSave?: boolean) => ({
        payload: { shouldSave: shouldSave || false },
      }),
      reducer: (state, action: PayloadAction<IClosePreferencesPayload>) => {},
    },
    didClosePreferences: (state) => {
      state.preferencesWindow.show = false;
    },
    chooseRecordHomeDir: (state) => {},
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
    quitApplication: (state) => {},
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
  quitApplication,
} = slice.actions;

export default slice.reducer;
