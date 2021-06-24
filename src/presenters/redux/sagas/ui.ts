/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import * as Effects from 'redux-saga/effects';

import { TYPES } from '@di/types';
import { diContainer } from '@di/container';
import { IPreferences } from '@core/entities/preferences';
import { IScreenInfo } from '@core/entities/screen';
import { CaptureStatus, ICaptureContext } from '@core/entities/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { AppUpdater } from '@presenters/interactor/updater';
import { UiDirector } from '@presenters/interactor/director';
import store, { RootState } from '@presenters/redux/store';
import {
  showAbout,
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
  checkForUpdates,
} from '@presenters/redux/ui/slice';
import {
  didFinishCapture,
  finishCapture,
} from '@presenters/redux/capture/slice';
import { IClosePreferencesPayload } from '@presenters/redux/ui/types';
import { IHookManager } from '@core/components/hook';
import { INITIAL_SHORTCUT, registerShortcut } from '@utils/shortcut';
import { GlobalRegistry } from '@core/components/registry';

const { put, select, takeLatest, takeLeading } = Effects;
const call: any = Effects.call;

const appUpdater = diContainer.get(AppUpdater);
const uiDirector = diContainer.get(UiDirector);
const prefsUseCase = diContainer.get(PreferencesUseCase);
const globalRegistry = diContainer.get(GlobalRegistry);
const hookManager = diContainer.get<IHookManager>(TYPES.HookManager);

function handleShowAbout(_action: PayloadAction) {
  uiDirector.openAboutPopup();
}

function* handleCheckForUpdates(_action: PayloadAction) {
  yield appUpdater.checkForUpdates();
}

function* handleLoadPreferences(_action: PayloadAction) {
  const prefs: IPreferences = yield call(prefsUseCase.getUserPreferences);

  yield put(
    didLoadPreferences({
      version: prefs.version,
      recordHomeDir: prefs.recordHomeDir || '',
      openRecordHomeDirWhenRecordCompleted:
        prefs.openRecordHomeDirWhenRecordCompleted,
      shortcut: prefs.shortcut,
    })
  );
}

function* handleOpenPreferences(_action: PayloadAction) {
  yield put(loadPreferences());

  uiDirector.openPreferencesModal();

  yield put(didOpenPreferences());
}

function* handleClosePreferences(
  action: PayloadAction<IClosePreferencesPayload>
) {
  if (action.payload.shouldSave) {
    const uiPrefs: IPreferences = yield select(
      (state: RootState) => state.ui.preferencesModal.preferences
    );

    yield call(prefsUseCase.updateUserPreference, uiPrefs);

    yield put(loadPreferences());
  }

  uiDirector.closePreferencesModal();
  uiDirector.refreshAppTrayState();

  yield put(didClosePreferences());
}

function* handleChooseRecordHomeDir(_action: PayloadAction) {
  const uiPrefs: IPreferences = yield select(
    (state: RootState) => state.ui.preferencesModal.preferences
  );

  const dir: string = yield call(
    uiDirector.openDialogForRecordHomeDir,
    uiPrefs.recordHomeDir
  );

  if (dir.length > 0) {
    yield put(didChooseRecordHomeDir({ recordHomeDir: dir }));
  }
}

function* handleEnableAreaSelection(_action: PayloadAction) {
  const screenInfos: Array<IScreenInfo> =
    uiDirector.enableCaptureSelectionMode();

  yield put(
    didEnableAreaSelection(
      screenInfos.map((s): IScreenInfo => ({ id: s.id, bounds: s.bounds }))
    )
  );
}

function* handleDisableAreaSelection(_action: PayloadAction) {
  uiDirector.disableCaptureSelectionMode();

  yield put(didDisableAreaSelection());
}

function* handleDidFinishCapture(action: PayloadAction<ICaptureContext>) {
  const captureCtx: ICaptureContext = action.payload;
  const uiPrefs: IPreferences = yield select(
    (state: RootState) => state.ui.preferencesModal.preferences
  );

  if (
    captureCtx.outputPath &&
    captureCtx.status === CaptureStatus.FINISHED &&
    uiPrefs.openRecordHomeDirWhenRecordCompleted
  ) {
    uiDirector.showItemInFolder(captureCtx.outputPath);
  }

  uiDirector.refreshAppTrayState();
}

function handleEnableRecording(_action: PayloadAction) {
  uiDirector.enableRecordingMode();
  uiDirector.refreshAppTrayState();
}

function handleQuitApplication(_action: PayloadAction) {
  uiDirector.quitApplication();
}

const handleCaptureShortcut = () => {
  const captCtx = globalRegistry.getCaptureContext();
  if (captCtx?.status === CaptureStatus.IN_PROGRESS) {
    store.dispatch(finishCapture());
  } else {
    store.dispatch(enableAreaSelection());
  }
};

const handlePrefsChanged = () => {
  const prefs = globalRegistry.getUserPreferences();
  const shortcut = prefs?.shortcut ?? INITIAL_SHORTCUT;
  registerShortcut(shortcut, handleCaptureShortcut);
};

function* sagaEntry() {
  yield takeLeading(loadPreferences.type, handleLoadPreferences);
  yield takeLatest(showAbout.type, handleShowAbout);
  yield takeLatest(checkForUpdates.type, handleCheckForUpdates);
  yield takeLatest(openPreferences.type, handleOpenPreferences);
  yield takeLatest(closePreferences.type, handleClosePreferences);
  yield takeLatest(chooseRecordHomeDir.type, handleChooseRecordHomeDir);
  yield takeLatest(enableAreaSelection.type, handleEnableAreaSelection);
  yield takeLatest(disableAreaSelection.type, handleDisableAreaSelection);
  yield takeLatest(enableRecording.type, handleEnableRecording);
  yield takeLatest(didFinishCapture.type, handleDidFinishCapture);
  yield takeLatest(quitApplication.type, handleQuitApplication);

  hookManager.on('after-preferences-loaded', handlePrefsChanged);
  hookManager.on('after-preferences-updated', handlePrefsChanged);
}

export default sagaEntry;
