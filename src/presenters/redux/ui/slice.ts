/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice } from '@reduxjs/toolkit';
import { IUiState } from './types';

const initialState: IUiState = {
  preferences: {
    show: false,
  },
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    initApplication: (state) => {},
    willOpenPreferences: (state) => {},
    didOpenPreferences: (state) => {
      state.preferences.show = true;
    },
    quitApplication: (state) => {},
  },
});

export const {
  initApplication,
  willOpenPreferences,
  didOpenPreferences,
  quitApplication,
} = slice.actions;

export default slice.reducer;
