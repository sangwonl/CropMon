/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { diContainer } from '@di/container';
import { UiDirector } from '@presenters/interactor';

import { openPreference, quitApplication } from './slice';

const uiDirector = diContainer.get(UiDirector);

const handleOpenPreference = (action: PayloadAction) => {
  uiDirector.openPreferenceWindow();
};

const handleQuitApplication = (action: PayloadAction) => {
  uiDirector.quitApplication();
};

function* sagaEntry() {
  // eslint-disable-next-line prettier/prettier
  yield takeLatest(openPreference.type, handleOpenPreference);
  yield takeLatest(quitApplication.type, handleQuitApplication);
}

export default sagaEntry;
