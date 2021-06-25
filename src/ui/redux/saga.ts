/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import * as Effects from 'redux-saga/effects';

import { TYPES } from '@di/types';
import { diContainer } from '@di/container';
import { IPreferences } from '@core/entities/preferences';
import { CaptureStatus } from '@core/entities/capture';
import { IFinishAreaSelection, IStartAreaSelection } from '@core/entities/ui';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { IHookManager } from '@core/interfaces/hook';
import { IUiDirector } from '@core/interfaces/director';
import { StateManager } from '@core/interfaces/state';
import { ActionDispatcher } from '@adapters/action';
import { INITIAL_SHORTCUT, registerShortcut } from '@utils/shortcut';

import { RootState } from './store';
import {
  enableCaptureMode,
  disableCaptureMode,
  startAreaSelection,
  finishAreaSelection,
  startCapture,
  finishCapture,
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
  checkForUpdates,
} from './slice';
import { IStartCapturePayload, IClosePreferencesPayload } from './types';

const { put, select, takeLatest, takeLeading } = Effects;
const call: any = Effects.call;

const prefsUseCase = diContainer.get(PreferencesUseCase);
const globalRegistry = diContainer.get(StateManager);
const actionDispatcher = diContainer.get(ActionDispatcher);
const hookManager = diContainer.get<IHookManager>(TYPES.HookManager);
const uiDirector = diContainer.get<IUiDirector>(TYPES.UiDirector);

function* onLoadPreferences(_action: PayloadAction) {
  const prefs: IPreferences = yield call(prefsUseCase.getUserPreferences);

  yield put(
    didLoadPreferences({
      version: prefs.version,
      recordHomeDir: prefs.recordHomeDir || '',
      openRecordHomeWhenRecordCompleted:
        prefs.openRecordHomeWhenRecordCompleted,
      shortcut: prefs.shortcut,
    })
  );
}

function* onOpenPreferences(_action: PayloadAction) {
  yield put(loadPreferences());

  uiDirector.openPreferencesModal();

  yield put(didOpenPreferences());
}

function* onClosePreferences(action: PayloadAction<IClosePreferencesPayload>) {
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

function* onChooseRecordHome(_action: PayloadAction) {
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

const onCaptureShortcut = () => {
  const captCtx = globalRegistry.getCaptureContext();
  if (captCtx?.status === CaptureStatus.IN_PROGRESS) {
    actionDispatcher.finishCapture();
  } else {
    actionDispatcher.enableCaptureSelection();
  }
};

const onPrefsChanged = () => {
  const prefs = globalRegistry.getUserPreferences();
  const shortcut = prefs?.shortcut ?? INITIAL_SHORTCUT;
  registerShortcut(shortcut, onCaptureShortcut);
};

function onCheckForUpdates() {
  actionDispatcher.checkForUpdates();
}

function onShowAbout() {
  actionDispatcher.showAboutPopup();
}

function onQuitApplication() {
  actionDispatcher.quitApplication();
}

function onEnableCaptureSelection() {
  actionDispatcher.enableCaptureSelection();
}

function onDisableCaptureSelection() {
  actionDispatcher.disableCaptureSelection();
}

function onStartAreaSelection(action: PayloadAction<IStartAreaSelection>) {
  actionDispatcher.startAreaSelection(action.payload.screenId);
}

function onFinishAreaSelection(action: PayloadAction<IFinishAreaSelection>) {
  actionDispatcher.finishAreaSelection(action.payload.bounds);
}

function onStartCapture(action: PayloadAction<IStartCapturePayload>) {
  actionDispatcher.startCapture(action.payload.screenId, action.payload.bounds);
}

function onFinishCapture() {
  actionDispatcher.finishCapture();
}

function* sagaEntry() {
  // app related use cases
  yield takeLatest(checkForUpdates.type, onCheckForUpdates);
  yield takeLatest(showAbout.type, onShowAbout);
  yield takeLatest(quitApplication.type, onQuitApplication);

  // capture related use cases
  yield takeLatest(enableCaptureMode.type, onEnableCaptureSelection);
  yield takeLatest(disableCaptureMode.type, onDisableCaptureSelection);
  yield takeLatest(startAreaSelection.type, onStartAreaSelection);
  yield takeLatest(finishAreaSelection.type, onFinishAreaSelection);
  yield takeLatest(startCapture.type, onStartCapture);
  yield takeLatest(finishCapture.type, onFinishCapture);

  // legacy..
  yield takeLeading(loadPreferences.type, onLoadPreferences);
  yield takeLatest(openPreferences.type, onOpenPreferences);
  yield takeLatest(closePreferences.type, onClosePreferences);
  yield takeLatest(chooseRecordHomeDir.type, onChooseRecordHome);

  hookManager.on('after-preferences-loaded', onPrefsChanged);
  hookManager.on('after-preferences-updated', onPrefsChanged);
}

export default sagaEntry;
