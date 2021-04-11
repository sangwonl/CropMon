import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CaptureState, CaptureContextDto } from './types';

const initialState: CaptureState = {
  curCaptureCtx: undefined,
};

const slice = createSlice({
  name: 'capture',
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuringCaptureParams: (state) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuredCaptureParams: (state) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    preparedCaptureContext: (
      state,
      action: PayloadAction<CaptureContextDto>
    ) => {
      state.curCaptureCtx = action.payload;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    startingCapture: (state) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    finishCapture: (state) => {},
  },
});

export const {
  configuringCaptureParams,
  configuredCaptureParams,
  preparedCaptureContext,
  startingCapture,
  finishCapture,
} = slice.actions;

export default slice.reducer;
