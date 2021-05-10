/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';

import { TYPES } from '@di/types';
import { diContainer } from '@di/container';
import { Preferences } from '@core/entities';
import { ScreenInfo } from '@core/entities/screen';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { UiDirector } from '@presenters/interactor';

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
  enableCaptureAreaSelection,
  didEnableCaptureAreaSelection,
  disableCaptureAreaSelection,
  didDisableCaptureAreaSelection,
  cancelCaptureAreaSelection,
} from './slice';
import { IScreenInfo } from '../common/types';
import { IClosePreferencesPayload, IPreferences } from './types';
import { RootState } from '../store';

const uiDirector = diContainer.get<UiDirector>(TYPES.UiDirector);
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

function* handleEnableCaptureAreaSelection(_action: PayloadAction) {
  const screenInfos: Array<ScreenInfo> = uiDirector.enableCaptureSelection();

  yield put(
    didEnableCaptureAreaSelection(
      screenInfos.map(
        (s): IScreenInfo => {
          return {
            id: s.id,
            bounds: {
              x: s.bounds.x,
              y: s.bounds.y,
              width: s.bounds.width,
              height: s.bounds.height,
            },
          };
        }
      )
    )
  );
}

function* handleDisableCaptureAreaSelection(_action: PayloadAction) {
  uiDirector.disableCaptureSelection();

  yield put(didDisableCaptureAreaSelection());
}

function* handleCancelCaptureAreaSelection(_action: PayloadAction) {
  yield put(disableCaptureAreaSelection());
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
  yield takeLatest(
    enableCaptureAreaSelection.type,
    handleEnableCaptureAreaSelection
  );
  yield takeLatest(
    disableCaptureAreaSelection.type,
    handleDisableCaptureAreaSelection
  );
  yield takeLatest(
    cancelCaptureAreaSelection.type,
    handleCancelCaptureAreaSelection
  );
  yield takeLatest(quitApplication.type, handleQuitApplication);
}

export default sagaEntry;
