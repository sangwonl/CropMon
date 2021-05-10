/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';

import { TYPES } from '@di/types';
import { diContainer } from '@di/container';
import { IPreferences } from '@core/entities/preferences';
import { IScreenInfo } from '@core/entities/screen';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { UiDirector } from '@presenters/interactor/director';

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
  enableAreaSelection,
  didEnableAreaSelection,
  disableAreaSelection,
  didDisableAreaSelection,
} from '@presenters/redux/ui/slice';
import { IClosePreferencesPayload } from '@presenters/redux/ui/types';
import { RootState } from '../store';

const uiDirector = diContainer.get<UiDirector>(TYPES.UiDirector);
const preferencesUseCase = diContainer.get(PreferencesUseCase);

function* handleLoadPreferences(_action: PayloadAction) {
  const prefs: IPreferences = yield call([
    preferencesUseCase,
    preferencesUseCase.getUserPreferences,
  ]);

  yield put(
    didLoadPreferences({
      recordHomeDir: prefs.recordHomeDir || '',
      openRecordHomeDirWhenRecordCompleted:
        prefs.openRecordHomeDirWhenRecordCompleted,
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

    const prefs: IPreferences = {
      recordHomeDir: uiPrefs.recordHomeDir,
      openRecordHomeDirWhenRecordCompleted:
        uiPrefs.openRecordHomeDirWhenRecordCompleted,
    };

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

function* handleEnableAreaSelection(_action: PayloadAction) {
  const screenInfos: Array<IScreenInfo> = uiDirector.enableCaptureSelection();

  yield put(
    didEnableAreaSelection(
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

function* handleDisableAreaSelection(_action: PayloadAction) {
  uiDirector.disableCaptureSelection();

  yield put(didDisableAreaSelection());
}

function handleQuitApplication(_action: PayloadAction) {
  uiDirector.quitApplication();
}

function* sagaEntry() {
  yield takeLeading(loadPreferences.type, handleLoadPreferences);
  yield takeLatest(openPreferences.type, handleOpenPreferences);
  yield takeLatest(closePreferences.type, handleClosePreferences);
  yield takeLatest(chooseRecordHomeDir.type, handleChooseRecordHomeDir);
  yield takeLatest(enableAreaSelection.type, handleEnableAreaSelection);
  yield takeLatest(disableAreaSelection.type, handleDisableAreaSelection);
  yield takeLatest(quitApplication.type, handleQuitApplication);
}

export default sagaEntry;