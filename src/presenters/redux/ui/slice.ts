import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
  },
});

export const { openPreference } = slice.actions;

export default slice.reducer;
