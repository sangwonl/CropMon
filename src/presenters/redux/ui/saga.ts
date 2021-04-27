/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';

import { Preferences } from '@core/entities';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { UiDirector } from '@presenters/interactor';
import { diContainer } from '@di/container';

import {
  loadPreferences,
  didLoadPreferences,
  openPreferences,
  didOpenPreferences,
  closePreferences,
  didClosePreferences,
  quitApplication,
  chooseRecordHomeDir,
  didChooseRecordHomeDir,
} from './slice';
import { IClosePreferencesPayload, IPreferences } from './types';
import { RootState } from '../store';

const uiDirector = diContainer.get(UiDirector);
const preferencesUseCase = diContainer.get(PreferencesUseCase);

function* handleLoadPreferences(_action: PayloadAction) {
  const prefs: Preferences = yield call([
    preferencesUseCase,
    preferencesUseCase.getUserPreferences,
  ]);

  yield put(
    didLoadPreferences({
      recordHomeDir: prefs.recordHomeDir || '',
      shouldOpenRecordHomeDir: prefs.openRecordHomeDirWhenRecordCompleted,
    })
  );
}

function* handleOpenPreferences(_action: PayloadAction) {
  yield put(loadPreferences());
  uiDirector.openPreferencesWindow();
  yield put(didOpenPreferences());
}

function* handleClosePreferences(
  action: PayloadAction<IClosePreferencesPayload>
) {
  if (action.payload.shouldSave) {
    const uiPrefs: IPreferences = yield select(
      (state: RootState) => state.ui.preferencesWindow.preferences
    );

    const prefs = new Preferences();
    prefs.recordHomeDir = uiPrefs.recordHomeDir;
    prefs.openRecordHomeDirWhenRecordCompleted =
      uiPrefs.shouldOpenRecordHomeDir;

    yield call(
      [preferencesUseCase, preferencesUseCase.updateUserPreference],
      prefs
    );
  }

  uiDirector.closePreferencesWindow();
  yield put(didClosePreferences());
}

function* handleChooseRecordHomeDir(_action: PayloadAction) {
  const dir: string = yield call([
    uiDirector,
    uiDirector.openDialogForRecordHomeDir,
  ]);

  if (dir.length > 0) {
    yield put(didChooseRecordHomeDir({ recordHomeDir: dir }));
  }
}

function handleQuitApplication(_action: PayloadAction) {
  uiDirector.quitApplication();
}

function* sagaEntry() {
  // eslint-disable-next-line prettier/prettier
  yield takeLeading(loadPreferences.type, handleLoadPreferences);
  yield takeLatest(openPreferences.type, handleOpenPreferences);
  yield takeLatest(closePreferences.type, handleClosePreferences);
  yield takeLatest(chooseRecordHomeDir.type, handleChooseRecordHomeDir);
  yield takeLatest(quitApplication.type, handleQuitApplication);
}

export default sagaEntry;
