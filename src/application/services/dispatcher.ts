import { injectable } from 'inversify';

import { CaptureMode, CaptureStatus } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';
import { CaptureOptions, RecordOptions } from '@domain/models/capture';

import AppUseCase from '@application/usecases/app';
import PreferencesUseCase from '@application/usecases/preferences';
import CaptureUseCase from '@application/usecases/capture';
import HookManager from '@application/services/hook';
import { ActionDispatcher } from '@application/ports/action';

import { adjustSelectionBounds } from '@utils/bounds';

@injectable()
export default class ActionDispatcherCore implements ActionDispatcher {
  constructor(
    private hookManager: HookManager,
    private appUseCase: AppUseCase,
    private prefsUseCase: PreferencesUseCase,
    private captureUseCase: CaptureUseCase
  ) {}

  initializeApp = () => {
    this.appUseCase.initializeApp();
  };

  checkForUpdates = () => {
    this.appUseCase.checkForUpdates();
  };

  downloadAndInstall = () => {
    this.appUseCase.downloadAndInstall();
  };

  showAbout = () => {
    this.appUseCase.showAboutPopup();
  };

  showHelp = () => {
    this.appUseCase.showHelpPopup();
  };

  quitApplication = () => {
    this.appUseCase.quitApplication();
  };

  openPreferences = () => {
    this.prefsUseCase.openPreferencesModal();
  };

  toggleRecordOptions = (recordOptions: RecordOptions) => {
    this.captureUseCase.toggleRecordOptions(recordOptions);
  };

  enableCaptureMode = (captureMode?: CaptureMode) => {
    this.captureUseCase.enableCaptureMode(captureMode);
  };

  disableCaptureMode = () => {
    this.captureUseCase.disableCaptureMode();
  };

  changeCaptureOptions = (options: CaptureOptions) => {
    this.captureUseCase.changeCaptureOptions(options);
  };

  startTargetSelection = () => {
    this.captureUseCase.startTargetSelection();
  };

  finishTargetSelection = (targetBounds: Bounds) => {
    this.captureUseCase.finishTargetSelection(
      adjustSelectionBounds(targetBounds)
    );
  };

  startCapture = () => {
    this.captureUseCase.startCapture();
  };

  startCaptureWithCurrentStates = () => {
    this.captureUseCase.startCaptureWithCurrentStates();
  };

  finishCapture = () => {
    this.captureUseCase.finishCapture();
  };

  onCaptureToggleShortcut = () => {
    const captCtx = this.captureUseCase.curCaptureContext();
    if (captCtx?.status === CaptureStatus.IN_PROGRESS) {
      this.finishCapture();
    } else {
      this.enableCaptureMode();

      this.hookManager.emit('capture-shortcut-triggered', {});
    }
  };
}
