/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPayloadChooseRecordHomeDir, IPreferences, IUiState } from './types';

const initialState: IUiState = {
  preferences: {
    show: false,
    recordHomeDir: '',
    shouldOpenRecordHomeDir: true,
  },
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    initApplication: (state) => {},
    didLoadPreferences: (state, action: PayloadAction<IPreferences>) => {
      const { recordHomeDir, shouldOpenRecordHomeDir } = action.payload;
      state.preferences.recordHomeDir = recordHomeDir;
      state.preferences.shouldOpenRecordHomeDir = shouldOpenRecordHomeDir;
    },
    willOpenPreferences: (state) => {},
    didOpenPreferences: (state) => {
      state.preferences.show = true;
    },
    willClosePreferences: (state) => {},
    didClosePreferences: (state) => {
      state.preferences.show = false;
    },
    willChooseRecordHomeDir: (state) => {},
    didChooseRecordHomeDir: (
      state,
      action: PayloadAction<IPayloadChooseRecordHomeDir>
    ) => {
      state.preferences.recordHomeDir = action.payload.recordHomeDir;
    },
    toggleOpenRecordHomeDir: (state) => {
      const { shouldOpenRecordHomeDir } = state.preferences;
      state.preferences.shouldOpenRecordHomeDir = !shouldOpenRecordHomeDir;
    },
    quitApplication: (state) => {},
  },
});

export const {
  initApplication,
  didLoadPreferences,
  willOpenPreferences,
  didOpenPreferences,
  willClosePreferences,
  didClosePreferences,
  toggleOpenRecordHomeDir,
  willChooseRecordHomeDir,
  didChooseRecordHomeDir,
  quitApplication,
} = slice.actions;

export default slice.reducer;
