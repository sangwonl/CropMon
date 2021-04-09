import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { diContainer } from '../../../di';
import { CaptureUseCase } from '../../../core/usecases/capture';
import { prepareCapture, capturePrepared, captureStarted } from './slice';

const captureUseCase = diContainer.get(CaptureUseCase);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* handlePrepareCapture(action: PayloadAction) {
  captureUseCase.prepareCapture();
  yield put(capturePrepared());
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* handleCapturePrepared(action: PayloadAction) {
  captureUseCase.startCapture();
  yield put(captureStarted());
}

function* sagaEntry() {
  yield takeLatest(prepareCapture.type, handlePrepareCapture);
  yield takeLatest(capturePrepared.type, handleCapturePrepared);
}

export default sagaEntry;
