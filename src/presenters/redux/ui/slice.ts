/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice } from '@reduxjs/toolkit';
import { IUiState } from './types';

const initialState: IUiState = {
  preference: {
    show: false,
  },
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    initApplication: (state) => {},
    willOpenPreference: (state) => {},
    didOpenPreference: (state) => {
      state.preference.show = true;
    },
    quitApplication: (state) => {},
  },
});

export const {
  initApplication,
  willOpenPreference,
  didOpenPreference,
  quitApplication,
} = slice.actions;

export default slice.reducer;
