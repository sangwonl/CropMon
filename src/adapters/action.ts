/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';

import { CaptureMode, CaptureStatus } from '@core/entities/capture';
import { IBounds } from '@core/entities/screen';
import { AppUseCase } from '@core/usecases/app';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { CaptureUseCase } from '@core/usecases/capture';

@injectable()
export class ActionDispatcher {
  constructor(
    private appUseCase: AppUseCase,
    private prefsUseCase: PreferencesUseCase,
    private captureUseCase: CaptureUseCase
  ) {}

  checkForUpdates() {
    this.appUseCase.checkForUpdates();
  }

  showAbout() {
    this.appUseCase.showAboutPopup();
  }

  quitApplication() {
    this.appUseCase.quitApplication();
  }

  openPreferences() {
    this.prefsUseCase.openPreferencesModal();
  }

  enableCaptureSelection() {
    this.captureUseCase.enableCaptureSelection();
  }

  disableCaptureSelection() {
    this.captureUseCase.disableCaptureSelection();
  }

  startAreaSelection() {
    this.captureUseCase.startAreaSelection();
  }

  finishAreaSelection(bounds: IBounds) {
    this.captureUseCase.finishAreaSelectionAndStartCapture(bounds);
  }

  finishCapture() {
    this.captureUseCase.finishCapture();
  }

  onCaptureToggleShortcut = () => {
    const captCtx = this.captureUseCase.curCaptureContext();
    if (captCtx?.status === CaptureStatus.IN_PROGRESS) {
      this.finishCapture();
    } else {
      this.enableCaptureSelection();
    }
  };
}
