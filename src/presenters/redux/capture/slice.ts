import { createSlice } from '@reduxjs/toolkit';

export interface CaptureState {
  test: string;
}

const initialState: CaptureState = {
  test: '',
};

const slice = createSlice({
  name: 'capture',
  initialState,
  reducers: {
    prepareCapture: (state) => {},
    capturePrepared: (state) => {},
    captureStarted: (state) => {},
  },
});

export const {
  prepareCapture,
  capturePrepared,
  captureStarted,
} = slice.actions;

export default slice.reducer;
