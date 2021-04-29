/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICaptureState, ICaptureContext } from './types';

const initialState: ICaptureState = {
  curCaptureCtx: undefined,
};

const slice = createSlice({
  name: 'capture',
  initialState,
  reducers: {
    configureCaptureParams: (_state) => {},
    configuredCaptureParams: (_state) => {},
    preparedCaptureContext: (state, action: PayloadAction<ICaptureContext>) => {
      state.curCaptureCtx = action.payload;
    },
    startingCapture: (state, action: PayloadAction<ICaptureContext>) => {
      state.curCaptureCtx = action.payload;
    },
    finishCapture: (_state) => {},
    finishedCapture: (state, action: PayloadAction<ICaptureContext>) => {
      state.curCaptureCtx = action.payload;
    },
  },
});

export const {
  configureCaptureParams,
  configuredCaptureParams,
  preparedCaptureContext,
  startingCapture,
  finishCapture,
  finishedCapture,
} = slice.actions;

export default slice.reducer;
