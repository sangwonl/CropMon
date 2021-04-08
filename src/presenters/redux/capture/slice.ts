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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prepareCapture: (state) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    capturePrepared: (state) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    captureStarted: (state) => {},
  },
});

export const {
  prepareCapture,
  capturePrepared,
  captureStarted,
} = slice.actions;

export default slice.reducer;
