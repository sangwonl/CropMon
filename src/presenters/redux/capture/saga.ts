import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { diContainer } from '../../../di';
import { CaptureUseCase } from '../../../core/usecases/capture';
import {
  configuringCaptureParams,
  configuredCaptureParams,
  preparedCaptureContext,
  startingCapture,
} from './slice';
import { CaptureContext } from '../../../core/entities/capture';
import { ICaptureContext } from './types';

const captureUseCase = diContainer.get(CaptureUseCase);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* handleConfiguringCaptureParams(action: PayloadAction) {
  yield put(configuredCaptureParams());
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* handleConfiguredCaptureParams(action: PayloadAction) {
  const mapper = (ctx: CaptureContext): ICaptureContext => {
    return {
      status: ctx.status,
      createdAt: Math.floor(ctx.createdAt.getTime() / 1000),
    };
  };

  const captureContext = captureUseCase.prepareCapture();
  yield put(preparedCaptureContext(mapper(captureContext)));

  const updatedContext = captureUseCase.startCapture();
  yield put(startingCapture(mapper(updatedContext)));
}

function* sagaEntry() {
  // eslint-disable-next-line prettier/prettier
  yield takeLatest(configuringCaptureParams.type, handleConfiguringCaptureParams);
  yield takeLatest(configuredCaptureParams.type, handleConfiguredCaptureParams);
}

export default sagaEntry;
