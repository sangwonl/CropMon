/* eslint-disable prettier/prettier */

import { PayloadAction } from '@reduxjs/toolkit';
import { takeLatest } from 'redux-saga/effects';

import { diContainer } from '@di/container';
import { CaptureMode, ICaptureOptions, IRecordOptions } from '@core/entities/capture';
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
  startTargetSelection,
  finishTargetSelection,
  startCapture,
  finishCapture,
  toggleRecOptions,
} from '@ui/redux/slice';

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
  yield takeLatest(toggleRecOptions.type, ({ payload }: PayloadAction<IRecordOptions>) => actionDispatcher.toggleRecordOptions(payload));

  // capture related usecase
  yield takeLatest(enableCaptureMode.type, ({ payload }: PayloadAction<CaptureMode | undefined>) => actionDispatcher.enableCaptureMode(payload));
  yield takeLatest(disableCaptureMode.type, () => actionDispatcher.disableCaptureMode());
  yield takeLatest(startTargetSelection.type, () => actionDispatcher.startTargetSelection());
  yield takeLatest(finishTargetSelection.type, ({ payload }: PayloadAction<ICaptureOptions>) => actionDispatcher.finishTargetSelection(payload));
  yield takeLatest(startCapture.type, () => actionDispatcher.startCapture());
  yield takeLatest(finishCapture.type, () => actionDispatcher.finishCapture());
}

export default sagaEntry;
