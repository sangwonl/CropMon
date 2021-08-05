/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PayloadAction } from '@reduxjs/toolkit';
import { takeLatest } from 'redux-saga/effects';

import { diContainer } from '@di/container';
import { IFinishAreaSelection, IRecordingOptions } from '@core/entities/ui';
import { ActionDispatcher } from '@adapters/action';
import { adjustSelectionBounds } from '@utils/bounds';

import {
  checkForUpdates,
  showAbout,
  showHelp,
  openPreferences,
  quitApplication,
  enableCaptureMode,
  disableCaptureMode,
  startAreaSelection,
  finishAreaSelection,
  finishCapture,
  toggleRecordingMic,
} from './slice';

const actionDispatcher = diContainer.get(ActionDispatcher);

function onCheckForUpdates() {
  actionDispatcher.checkForUpdates();
}

function onShowAbout() {
  actionDispatcher.showAbout();
}

function onShowHelp() {
  actionDispatcher.showHelp();
}

function onQuitApplication() {
  actionDispatcher.quitApplication();
}

function onOpenPreferences() {
  actionDispatcher.openPreferences();
}

function onToggleRecordingMic(action: PayloadAction<IRecordingOptions>) {
  actionDispatcher.toggleRecordingMic(action.payload.enableMicrophone);
}

function onEnableCaptureSelection() {
  actionDispatcher.enableCaptureSelection();
}

function onDisableCaptureSelection() {
  actionDispatcher.disableCaptureSelection();
}

function onStartAreaSelection() {
  actionDispatcher.startAreaSelection();
}

function onFinishAreaSelection(action: PayloadAction<IFinishAreaSelection>) {
  actionDispatcher.finishAreaSelection(
    adjustSelectionBounds(action.payload.bounds)
  );
}

function onFinishCapture() {
  actionDispatcher.finishCapture();
}

function* sagaEntry() {
  // app related usecase
  yield takeLatest(checkForUpdates.type, onCheckForUpdates);
  yield takeLatest(showAbout.type, onShowAbout);
  yield takeLatest(showHelp.type, onShowHelp);
  yield takeLatest(quitApplication.type, onQuitApplication);

  // preferences usecase
  yield takeLatest(openPreferences.type, onOpenPreferences);
  yield takeLatest(toggleRecordingMic.type, onToggleRecordingMic);

  // capture related usecase
  yield takeLatest(enableCaptureMode.type, onEnableCaptureSelection);
  yield takeLatest(disableCaptureMode.type, onDisableCaptureSelection);
  yield takeLatest(startAreaSelection.type, onStartAreaSelection);
  yield takeLatest(finishAreaSelection.type, onFinishAreaSelection);
  yield takeLatest(finishCapture.type, onFinishCapture);
}

export default sagaEntry;
