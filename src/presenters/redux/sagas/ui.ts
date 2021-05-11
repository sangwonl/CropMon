/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';

import { TYPES } from '@di/types';
import { diContainer } from '@di/container';
import { IPreferences } from '@core/entities/preferences';
import { IScreenInfo } from '@core/entities/screen';
import { ICaptureContext } from '@core/entities/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { UiDirector } from '@presenters/interactor/director';
import { RootState } from '@presenters/redux/store';
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
  enableRecording,
} from '@presenters/redux/ui/slice';
import {
  ICaptureArea,
  IClosePreferencesPayload,
} from '@presenters/redux/ui/types';

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

    yield put(loadPreferences());
  }

  uiDirector.closePreferencesWindow();

  yield put(didClosePreferences());
}

function* handleChooseRecordHomeDir(_action: PayloadAction) {
  const uiPrefs: IPreferences = yield select(
    (state: RootState) => state.ui.preferencesWindow.preferences
  );

  const dir: string = yield call(
    [uiDirector, uiDirector.openDialogForRecordHomeDir],
    uiPrefs.recordHomeDir
  );

  if (dir.length > 0) {
    yield put(didChooseRecordHomeDir({ recordHomeDir: dir }));
  }
}

function* handleEnableAreaSelection(_action: PayloadAction) {
  const screenInfos: Array<IScreenInfo> = uiDirector.enableCaptureSelection();

  yield put(
    didEnableAreaSelection(
      screenInfos.map((s): IScreenInfo => ({ id: s.id, bounds: s.bounds }))
    )
  );
}

function* handleDisableAreaSelection(_action: PayloadAction) {
  const uiPrefs: IPreferences = yield select(
    (state: RootState) => state.ui.preferencesWindow.preferences
  );

  const captureArea: ICaptureArea = yield select(
    (state: RootState) => state.ui.captureArea
  );

  const captureCtx: ICaptureContext = yield select(
    (state: RootState) => state.capture.curCaptureCtx
  );

  if (
    captureArea.isRecording &&
    uiPrefs.openRecordHomeDirWhenRecordCompleted &&
    captureCtx.outputPath
  ) {
    uiDirector.showItemInFolder(captureCtx.outputPath);
  }

  uiDirector.disableCaptureSelection();

  yield put(didDisableAreaSelection());
}

function* handleEnableRecording(_action: PayloadAction) {
  uiDirector.enableRecordingMode();
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
  yield takeLatest(enableRecording.type, handleEnableRecording);
  yield takeLatest(quitApplication.type, handleQuitApplication);
}

export default sagaEntry;
