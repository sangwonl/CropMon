/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { CaptureMode } from '@core/entities/capture';
import { CaptureUseCase } from '@core/usecases/capture';
import { diContainer } from '@di/container';

import { IStartCapturePayload } from './types';

import {
  startCapture,
  didStartCapture,
  finishCapture,
  didFinishCapture,
} from './slice';

const captureUseCase = diContainer.get(CaptureUseCase);

function* handleStartCapture(action: PayloadAction<IStartCapturePayload>) {
  const newContext = captureUseCase.startCapture({
    mode: CaptureMode.AREA,
    screenId: action.payload.screenId,
    bounds: action.payload.bounds,
  });
  yield put(didStartCapture(newContext));
}

function* handleFinishCapture(_action: PayloadAction) {
  const updatedContext = captureUseCase.finishCapture();
  yield put(didFinishCapture(updatedContext));
}

function* sagaEntry() {
  yield takeLatest(startCapture.type, handleStartCapture);
  yield takeLatest(finishCapture.type, handleFinishCapture);
}

export default sagaEntry;
