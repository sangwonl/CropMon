/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { apply, put, takeLatest, takeLeading } from 'redux-saga/effects';

import { Preferences } from '@core/entities';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { UiDirector } from '@presenters/interactor';
import { diContainer } from '@di/container';

import {
  initApplication,
  didLoadPreferences,
  willOpenPreferences,
  didOpenPreferences,
  willClosePreferences,
  didClosePreferences,
  quitApplication,
  willChooseRecordHomeDir,
  didChooseRecordHomeDir,
} from './slice';

const uiDirector = diContainer.get(UiDirector);
const preferencesUseCase = diContainer.get(PreferencesUseCase);

function* handleInitApplication(action: PayloadAction) {
  const prefs: Preferences = yield apply(
    preferencesUseCase,
    preferencesUseCase.getUserPreferences,
    []
  );
  yield put(
    didLoadPreferences({
      show: false,
      recordHomeDir: prefs.recordHomeDir || '',
      shouldOpenRecordHomeDir: prefs.openRecordHomeDirWhenRecordCompleted,
    })
  );
}

function* handleOpenPreferences(action: PayloadAction) {
  uiDirector.openPreferencesWindow();
  yield put(didOpenPreferences());
}

function* handleClosePreferences(action: PayloadAction) {
  uiDirector.closePreferencesWindow();
  yield put(didClosePreferences());
}

function* handleChooseRecordHomeDir(action: PayloadAction) {
  const dir: string = yield apply(
    uiDirector,
    uiDirector.openDialogForRecordHomeDir,
    []
  );

  if (dir.length > 0) {
    yield put(didChooseRecordHomeDir({ recordHomeDir: dir }));
  }
}

function handleQuitApplication(action: PayloadAction) {
  uiDirector.quitApplication();
}

function* sagaEntry() {
  // eslint-disable-next-line prettier/prettier
  yield takeLeading(initApplication.type, handleInitApplication);
  yield takeLatest(willOpenPreferences.type, handleOpenPreferences);
  yield takeLatest(willClosePreferences.type, handleClosePreferences);
  yield takeLatest(willChooseRecordHomeDir.type, handleChooseRecordHomeDir);
  yield takeLatest(quitApplication.type, handleQuitApplication);
}

export default sagaEntry;
