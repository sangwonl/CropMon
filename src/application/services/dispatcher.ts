import { injectable } from 'inversify';

import { CaptureMode, CaptureStatus } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';
import { CaptureOptions, RecordOptions } from '@domain/models/capture';

import InitializeAppUseCase from '@application/usecases/InitializeApp';
import QuitAppUseCase from '@application/usecases/QuitApp';
import CheckUpdateUseCase from '@application/usecases/CheckUpdate';
import UpdateAppUseCase from '@application/usecases/UpdateApp';
import OpenAboutPopupUseCase from '@application/usecases/OpenAboutPopup';
import OpenHelpPopupUseCase from '@application/usecases/OpenHelpPopup';
import OpenPrefsModalUseCase from '@application/usecases/OpenPrefsModal';

import CaptureUseCase from '@application/usecases/capture';
import HookManager from '@application/services/hook';
import { ActionDispatcher } from '@application/ports/action';

import { adjustSelectionBounds } from '@utils/bounds';

@injectable()
export default class ActionDispatcherCore implements ActionDispatcher {
  constructor(
    private initializeAppUseCase: InitializeAppUseCase,
    private quitAppUseCase: QuitAppUseCase,
    private checkUpdateUseCase: CheckUpdateUseCase,
    private updateAppUseCase: UpdateAppUseCase,
    private openAboutPopupUseCase: OpenAboutPopupUseCase,
    private openHelpPopupUseCase: OpenHelpPopupUseCase,
    private openPrefsModalUseCase: OpenPrefsModalUseCase,

    private captureUseCase: CaptureUseCase,

    private hookManager: HookManager
  ) {}

  initializeApp = () => {
    this.initializeAppUseCase.execute();
  };

  checkForUpdates = () => {
    this.checkUpdateUseCase.execute();
  };

  downloadAndInstall = () => {
    this.updateAppUseCase.execute();
  };

  showAbout = () => {
    this.openAboutPopupUseCase.execute();
  };

  showHelp = () => {
    this.openHelpPopupUseCase.execute();
  };

  quitApplication = () => {
    this.quitAppUseCase.execute();
  };

  openPreferences = () => {
    this.openPrefsModalUseCase.execute();
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
