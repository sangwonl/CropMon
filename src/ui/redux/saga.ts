/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { takeLatest } from 'redux-saga/effects';

import { TYPES } from '@di/types';
import { diContainer } from '@di/container';
import { CaptureStatus } from '@core/entities/capture';
import { IFinishAreaSelection, IStartAreaSelection } from '@core/entities/ui';
import { CaptureUseCase } from '@core/usecases/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { IHookManager } from '@core/interfaces/hook';
import { ActionDispatcher } from '@adapters/action';
import { INITIAL_SHORTCUT, registerShortcut } from '@utils/shortcut';

import {
  checkForUpdates,
  showAbout,
  openPreferences,
  quitApplication,
  enableCaptureMode,
  disableCaptureMode,
  startAreaSelection,
  finishAreaSelection,
  startCapture,
  finishCapture,
} from './slice';
import { IStartCapturePayload } from './types';

const captUseCase = diContainer.get(CaptureUseCase);
const prefsUseCase = diContainer.get(PreferencesUseCase);
const actionDispatcher = diContainer.get(ActionDispatcher);
const hookManager = diContainer.get<IHookManager>(TYPES.HookManager);

const onCaptureShortcut = () => {
  const captCtx = captUseCase.curCaptureContext();
  if (captCtx?.status === CaptureStatus.IN_PROGRESS) {
    actionDispatcher.finishCapture();
  } else {
    actionDispatcher.enableCaptureSelection();
  }
};

const onPrefsChanged = async () => {
  const prefs = await prefsUseCase.fetchUserPreferences();
  const shortcut = prefs.shortcut ?? INITIAL_SHORTCUT;
  registerShortcut(shortcut, onCaptureShortcut);
};

function onCheckForUpdates() {
  actionDispatcher.checkForUpdates();
}

function onShowAbout() {
  actionDispatcher.showAbout();
}

function onQuitApplication() {
  actionDispatcher.quitApplication();
}

function onOpenPreferences() {
  actionDispatcher.openPreferences();
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
  // app related usecase
  yield takeLatest(checkForUpdates.type, onCheckForUpdates);
  yield takeLatest(showAbout.type, onShowAbout);
  yield takeLatest(quitApplication.type, onQuitApplication);

  // preferences usecase
  yield takeLatest(openPreferences.type, onOpenPreferences);

  // capture related usecase
  yield takeLatest(enableCaptureMode.type, onEnableCaptureSelection);
  yield takeLatest(disableCaptureMode.type, onDisableCaptureSelection);
  yield takeLatest(startAreaSelection.type, onStartAreaSelection);
  yield takeLatest(finishAreaSelection.type, onFinishAreaSelection);
  yield takeLatest(startCapture.type, onStartCapture);
  yield takeLatest(finishCapture.type, onFinishCapture);

  hookManager.on('after-preferences-loaded', onPrefsChanged);
  hookManager.on('after-preferences-updated', onPrefsChanged);
}

export default sagaEntry;
