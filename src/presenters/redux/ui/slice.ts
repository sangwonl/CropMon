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
    openPreference: (state) => {
      state.preference.show = true;
    },
    quitApplication: (state) => {},
  },
});

export const { openPreference, quitApplication } = slice.actions;

export default slice.reducer;
