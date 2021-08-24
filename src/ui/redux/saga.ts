/* eslint-disable prettier/prettier */

import { PayloadAction } from '@reduxjs/toolkit';
import { takeLatest } from 'redux-saga/effects';

import { diContainer } from '@di/container';
import { IFinishAreaSelection, IRecordingOptions } from '@core/entities/ui';
import { ActionDispatcher } from '@adapters/action';

import {
  checkForUpdates,
  downloadAndInstall,
  showAbout,
  showHelp,
  openPreferences,
  quitApplication,
  enableCaptureMode,
  disableCaptureMode,
  startAreaSelection,
  finishAreaSelection,
  finishCapture,
  toggleRecOptions,
} from './slice';

const actionDispatcher = diContainer.get(ActionDispatcher);

function* sagaEntry() {
  // app related usecase
  yield takeLatest(checkForUpdates.type, () => actionDispatcher.checkForUpdates());
  yield takeLatest(downloadAndInstall.type, () => actionDispatcher.downloadAndInstall());
  yield takeLatest(showAbout.type, () => actionDispatcher.showAbout());
  yield takeLatest(showHelp.type, () => actionDispatcher.showHelp());
  yield takeLatest(quitApplication.type, () => actionDispatcher.quitApplication());

  // preferences usecase
  yield takeLatest(openPreferences.type, () => actionDispatcher.openPreferences());
  yield takeLatest(toggleRecOptions.type, ({ payload }: PayloadAction<IRecordingOptions>) => actionDispatcher.toggleRecordingOptions(payload));

  // capture related usecase
  yield takeLatest(enableCaptureMode.type, () => actionDispatcher.enableCaptureSelection());
  yield takeLatest(disableCaptureMode.type, () => actionDispatcher.disableCaptureSelection());
  yield takeLatest(startAreaSelection.type, () => actionDispatcher.startAreaSelection());
  yield takeLatest(finishAreaSelection.type, ({ payload }: PayloadAction<IFinishAreaSelection>) => actionDispatcher.finishAreaSelection(payload.bounds));
  yield takeLatest(finishCapture.type, () => actionDispatcher.finishCapture());
}

export default sagaEntry;
