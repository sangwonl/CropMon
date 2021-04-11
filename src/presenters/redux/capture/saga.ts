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

const captureUseCase = diContainer.get(CaptureUseCase);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* handleConfiguringCaptureParams(action: PayloadAction) {
  yield put(configuredCaptureParams());
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* handleConfiguredCaptureParams(action: PayloadAction) {
  const captureContext = captureUseCase.prepareCapture();

  yield put(preparedCaptureContext({ sessionId: captureContext.sessionId }));

  // captureUseCase.startCapture(captureContext);

  yield put(startingCapture());
}

function* sagaEntry() {
  // eslint-disable-next-line prettier/prettier
  yield takeLatest(configuringCaptureParams.type, handleConfiguringCaptureParams);
  yield takeLatest(configuredCaptureParams.type, handleConfiguredCaptureParams);
}

export default sagaEntry;
