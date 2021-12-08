/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';

import {
  CaptureMode,
  CaptureStatus,
  ICaptureOptions,
  IRecordOptions,
} from '@core/entities/capture';
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

  toggleRecordOptions(recordOptions: IRecordOptions) {
    this.captureUseCase.toggleRecordOptions(recordOptions);
  }

  enableCaptureMode(captureMode?: CaptureMode) {
    this.captureUseCase.enableCaptureMode(captureMode);
  }

  disableCaptureMode() {
    this.captureUseCase.disableCaptureMode();
  }

  startTargetSelection() {
    this.captureUseCase.startTargetSelection();
  }

  finishTargetSelection(options: ICaptureOptions) {
    const { bounds: targetBounds } = options.target;
    const target = {
      ...options.target,
      bounds: targetBounds && adjustSelectionBounds(targetBounds),
    };
    this.captureUseCase.finishTargetSelection(target, options.recordOptions);
  }

  startCapture() {
    this.captureUseCase.startCapture();
  }

  finishCapture() {
    this.captureUseCase.finishCapture();
  }

  onCaptureToggleShortcut = () => {
    const captCtx = this.captureUseCase.curCaptureContext();
    if (captCtx?.status === CaptureStatus.IN_PROGRESS) {
      this.finishCapture();
    } else {
      this.enableCaptureMode();
    }
  };
}
