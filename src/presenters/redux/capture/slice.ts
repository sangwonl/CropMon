/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICaptureState, ICaptureContext, IStartCapturePayload } from './types';

const initialState: ICaptureState = {
  curCaptureCtx: undefined,
};

const slice = createSlice({
  name: 'capture',
  initialState,
  reducers: {
    startCapture: (_state, _action: PayloadAction<IStartCapturePayload>) => {},
    didStartCapture: (state, action: PayloadAction<ICaptureContext>) => {
      state.curCaptureCtx = action.payload;
    },
    finishCapture: (_state) => {},
    didFinishCapture: (state, action: PayloadAction<ICaptureContext>) => {
      state.curCaptureCtx = action.payload;
    },
  },
});

export const {
  startCapture,
  didStartCapture,
  finishCapture,
  didFinishCapture,
} = slice.actions;

export default slice.reducer;
