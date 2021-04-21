/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { diContainer } from '@di/container';
import { UiDirector } from '@presenters/interactor';

import { openPreference } from './slice';

const uiDirector = diContainer.get(UiDirector);

const handleOpenPreference = (action: PayloadAction) => {
  uiDirector.openPreferenceWindow();
};

function* sagaEntry() {
  // eslint-disable-next-line prettier/prettier
  yield takeLatest(openPreference.type, handleOpenPreference);
}

export default sagaEntry;
