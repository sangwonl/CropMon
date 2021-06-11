/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import * as Effects from 'redux-saga/effects';

import {
  CaptureMode,
  CaptureStatus,
  ICaptureContext,
} from '@core/entities/capture';
import { CaptureUseCase } from '@core/usecases/capture';
import { diContainer } from '@di/container';
import { IStartCapturePayload } from '@presenters/redux/capture/types';

import {
  startCapture,
  didStartCapture,
  finishCapture,
  didFinishCapture,
} from '@presenters/redux/capture/slice';

import {
  disableAreaSelection,
  enableRecording,
} from '@presenters/redux/ui/slice';

const { put, takeLatest } = Effects;
const call: any = Effects.call;

const captureUseCase = diContainer.get(CaptureUseCase);

function* handleStartCapture(action: PayloadAction<IStartCapturePayload>) {
  const captureOpt = {
    mode: CaptureMode.AREA,
    screenId: action.payload.screenId,
    bounds: action.payload.bounds,
  };
  const newContext: ICaptureContext = yield call(
    captureUseCase.startCapture,
    captureOpt
  );

  if (newContext.status === CaptureStatus.IN_PROGRESS) {
    yield put(enableRecording());
    yield put(didStartCapture(newContext));
  } else {
    yield put(disableAreaSelection());
  }
}

function* handleFinishCapture(_action: PayloadAction) {
  yield put(disableAreaSelection());
  const updatedContext: ICaptureContext = yield call(
    captureUseCase.finishCapture
  );
  yield put(didFinishCapture(updatedContext));
}

function* sagaEntry() {
  yield takeLatest(startCapture.type, handleStartCapture);
  yield takeLatest(finishCapture.type, handleFinishCapture);
}

export default sagaEntry;
