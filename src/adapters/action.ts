/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import { CaptureMode, CaptureStatus } from '@core/entities/common';
import { IBounds } from '@core/entities/screen';
import { ICaptureOptions, IRecordOptions } from '@core/entities/capture';
import { AppUseCase } from '@core/usecases/app';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { CaptureUseCase } from '@core/usecases/capture';
import { IHookManager } from '@core/interfaces/hook';
import { adjustSelectionBounds } from '@utils/bounds';

@injectable()
export class ActionDispatcher {
  constructor(
    private appUseCase: AppUseCase,
    private prefsUseCase: PreferencesUseCase,
    private captureUseCase: CaptureUseCase,
    @inject(TYPES.HookManager) private hookManager: IHookManager
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

  changeCaptureOptions(options: ICaptureOptions) {
    this.captureUseCase.changeCaptureOptions(options);
  }

  startTargetSelection() {
    this.captureUseCase.startTargetSelection();
  }

  finishTargetSelection(targetBounds: IBounds) {
    this.captureUseCase.finishTargetSelection(
      adjustSelectionBounds(targetBounds)
    );
  }

  startCapture() {
    this.captureUseCase.startCapture();
  }

  finishCapture() {
    this.captureUseCase.finishCapture();
  }

  onCaptureToggleShortcut = () => {
    this.hookManager.emit('capture-shortcut-triggered', {});

    const captCtx = this.captureUseCase.curCaptureContext();
    if (captCtx?.status === CaptureStatus.IN_PROGRESS) {
      this.finishCapture();
    } else {
      this.enableCaptureMode();
    }
  };
}
