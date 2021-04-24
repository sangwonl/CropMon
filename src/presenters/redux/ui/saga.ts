/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { diContainer } from '@di/container';
import { PreferenceUseCase } from '@core/usecases/preference';
import { UiDirector } from '@presenters/interactor';

import { initApplication, willOpenPreference, quitApplication } from './slice';

const uiDirector = diContainer.get(UiDirector);
const preferenceUseCase = diContainer.get(PreferenceUseCase);

const handleInitApplication = async (action: PayloadAction) => {
  const preference = await preferenceUseCase.getUserPreference();
};

const handleOpenPreference = (action: PayloadAction) => {
  uiDirector.openPreferenceWindow();
};

const handleQuitApplication = (action: PayloadAction) => {
  uiDirector.quitApplication();
};

function* sagaEntry() {
  // eslint-disable-next-line prettier/prettier
  yield takeLatest(initApplication.type, handleInitApplication);
  yield takeLatest(willOpenPreference.type, handleOpenPreference);
  yield takeLatest(quitApplication.type, handleQuitApplication);
}

export default sagaEntry;
