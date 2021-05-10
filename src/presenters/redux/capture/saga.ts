/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { ScreenBounds } from '@core/entities/screen';
import { CaptureContext, CaptureMode } from '@core/entities/capture';
import { CaptureUseCase } from '@core/usecases/capture';
import { diContainer } from '@di/container';

import { ICaptureContext, IStartCapturePayload } from './types';
import {
  startCapture,
  didStartCapture,
  finishCapture,
  didFinishCapture,
} from './slice';

const captureUseCase = diContainer.get(CaptureUseCase);

const captureCtxMapper = (ctx: CaptureContext): ICaptureContext => {
  return {
    screenId: ctx.target.screenId,
    bounds: ctx.target.bounds,
    status: ctx.status,
    createdAt: Math.floor(ctx.createdAt.getTime() / 1000),
  };
};

function* handleStartCapture(action: PayloadAction<IStartCapturePayload>) {
  const { bounds } = action.payload;
  const newContext = captureUseCase.startCapture({
    mode: CaptureMode.AREA,
    screenId: action.payload.screenId,
    bounds: bounds ? ScreenBounds.fromBounds(bounds) : undefined,
  });
  yield put(didStartCapture(captureCtxMapper(newContext)));
}

function* handleFinishCapture(_action: PayloadAction) {
  const updatedContext = captureUseCase.finishCapture();
  yield put(didFinishCapture(captureCtxMapper(updatedContext)));
}

function* sagaEntry() {
  yield takeLatest(startCapture.type, handleStartCapture);
  yield takeLatest(finishCapture.type, handleFinishCapture);
}

export default sagaEntry;
