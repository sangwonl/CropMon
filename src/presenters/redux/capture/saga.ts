import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { CaptureUseCase } from '../../../core/usecases/capture';
import { diContainer } from '../../../infrastructures/di';
import { prepareCapture, capturePrepared, captureStarted } from './slice';

const captureUseCase = diContainer.get(CaptureUseCase);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* onPrepareCapture(action: PayloadAction) {
  captureUseCase.prepareCapture();
  yield put(capturePrepared());
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* onCapturePrepared(action: PayloadAction) {
  captureUseCase.startCapture();
  yield put(captureStarted());
}

function* sagaEntry() {
  yield takeLatest(prepareCapture.type, onPrepareCapture);
  yield takeLatest(capturePrepared.type, onCapturePrepared);
}

export default sagaEntry;
