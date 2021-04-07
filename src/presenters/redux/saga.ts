import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { CaptureUseCase } from '../../core/usecases/capture';
import { diContainer } from '../../infrastructures/di';

import { decrement, increment } from './counter/counterSlice';

const captureUseCase = diContainer.get(CaptureUseCase);

function* handleIncrement(action: PayloadAction) {
  captureUseCase.prepareCapture();
  yield put(decrement());
}

function* sagaEntry() {
  yield takeLatest(increment.type, handleIncrement);
}

export default sagaEntry;
