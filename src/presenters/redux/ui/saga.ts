/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { diContainer } from '@di/container';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { UiDirector } from '@presenters/interactor';

import {
  initApplication,
  willOpenPreferences,
  didOpenPreferences,
  quitApplication,
} from './slice';

const uiDirector = diContainer.get(UiDirector);
const preferencesUseCase = diContainer.get(PreferencesUseCase);

async function handleInitApplication(action: PayloadAction) {
  const prefs = await preferencesUseCase.getUserPreferences();

  // change ui preference state
}

function* handleOpenPreferences(action: PayloadAction) {
  uiDirector.openPreferencesWindow();
  yield put(didOpenPreferences());
}

function handleQuitApplication(action: PayloadAction) {
  uiDirector.quitApplication();
}

function* sagaEntry() {
  // eslint-disable-next-line prettier/prettier
  yield takeLatest(initApplication.type, handleInitApplication);
  yield takeLatest(willOpenPreferences.type, handleOpenPreferences);
  yield takeLatest(quitApplication.type, handleQuitApplication);
}

export default sagaEntry;
