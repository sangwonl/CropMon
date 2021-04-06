import { createSlice } from '@reduxjs/toolkit';

import { CaptureUseCase } from '../../../core/usecases/capture';
import { diContainer } from '../../../infrastructures/di';

import * as utils from '../../../utils';

const captureUseCase = diContainer.get(CaptureUseCase);

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      if (utils.isMain()) {
        captureUseCase.prepareCapture();
      }
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
