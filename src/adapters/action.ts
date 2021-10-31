/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';

import {
  CaptureMode,
  CaptureStatus,
  IRecordingOptions,
} from '@core/entities/capture';
import { IBounds } from '@core/entities/screen';
import { AppUseCase } from '@core/usecases/app';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { CaptureUseCase } from '@core/usecases/capture';
import { adjustSelectionBounds } from '@utils/bounds';

@injectable()
export class ActionDispatcher {
  constructor(
    private appUseCase: AppUseCase,
    private prefsUseCase: PreferencesUseCase,
    private captureUseCase: CaptureUseCase
  ) {}

  initializeApp() {
    this.appUseCase.initializeApp();
  }

  checkForUpdates() {
    this.appUseCase.checkForUpdates();
  }

  downloadAndInstall() {
    this.appUseCase.downloadAndInstall();
  }

  showAbout() {
    this.appUseCase.showAboutPopup();
  }

  showHelp() {
    this.appUseCase.showHelpPopup();
  }

  quitApplication() {
    this.appUseCase.quitApplication();
  }

  openPreferences() {
    this.prefsUseCase.openPreferencesModal();
  }

  toggleRecordingOptions(recOptions: IRecordingOptions) {
    this.captureUseCase.toggleRecordingOptions(recOptions);
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
    this.captureUseCase.finishAreaSelection(adjustSelectionBounds(bounds));
  }

  startCapture(bounds: IBounds) {
    this.captureUseCase.startCapture({
      mode: CaptureMode.AREA,
      bounds: adjustSelectionBounds(bounds),
    });
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
