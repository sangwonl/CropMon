/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { diContainer } from '@di/container';
import { CaptureUseCase } from '@core/usecases/capture';
import { CaptureContext, CaptureMode } from '@core/entities/capture';

import { ICaptureContext } from './types';
import {
  configureCaptureParams,
  configuredCaptureParams,
  preparedCaptureContext,
  startingCapture,
  finishCapture,
  finishedCapture,
} from './slice';

const captureUseCase = diContainer.get(CaptureUseCase);

const captureCtxMapper = (ctx: CaptureContext): ICaptureContext => {
  return {
    status: ctx.status,
    createdAt: Math.floor(ctx.createdAt.getTime() / 1000),
  };
};

function* handleConfiguringCaptureParams(action: PayloadAction) {
  yield put(configuredCaptureParams());
}

function* handleConfiguredCaptureParams(action: PayloadAction) {
  const captureContext = captureUseCase.prepareCapture({
    mode: CaptureMode.FULLSCREEN,
    screenIndex: 0,
  });
  yield put(preparedCaptureContext(captureCtxMapper(captureContext)));

  const updatedContext = captureUseCase.startCapture();
  yield put(startingCapture(captureCtxMapper(updatedContext)));
}

function* handleFinishCapture(action: PayloadAction) {
  const updatedContext = captureUseCase.finishCapture();
  yield put(finishedCapture(captureCtxMapper(updatedContext)));
}

function* sagaEntry() {
  // eslint-disable-next-line prettier/prettier
  yield takeLatest(configureCaptureParams.type, handleConfiguringCaptureParams);
  yield takeLatest(configuredCaptureParams.type, handleConfiguredCaptureParams);
  yield takeLatest(finishCapture.type, handleFinishCapture);
}

export default sagaEntry;
