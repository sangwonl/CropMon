import { injectable } from 'inversify';

import { Bounds } from '@domain/models/screen';
import { CaptureOptions, RecordOptions } from '@domain/models/capture';

import InitializeAppUseCase from '@application/usecases/InitializeApp';
import QuitAppUseCase from '@application/usecases/QuitApp';
import CheckUpdateUseCase from '@application/usecases/CheckUpdate';
import UpdateAppUseCase from '@application/usecases/UpdateApp';
import OpenAboutPopupUseCase from '@application/usecases/OpenAboutPopup';
import OpenHelpPopupUseCase from '@application/usecases/OpenHelpPopup';
import OpenPrefsModalUseCase from '@application/usecases/OpenPrefsModal';
import ToggleRecordOptionsUseCase from '@application/usecases/ToggleRecordOptions';
import StartSelectionUseCase from '@application/usecases/StartSelection';
import StartCaptureAsIsUseCase from '@application/usecases/StartCaptureAsIs';
import EnableCaptureUseCase from '@application/usecases/EnableCapture';
import DisableCaptureUseCase from '@application/usecases/DisableCapture';
import ChangeCaptureOptionsUseCase from '@application/usecases/ChangeCaptureOptions';
import FinishSelectionUseCase from '@application/usecases/FinishSelection';
import StartCaptureUseCase from '@application/usecases/StartCapture';
import FinishCaptureUseCase from '@application/usecases/FinishCapture';
import ToggleCaptureUseCase from '@application/usecases/ToggleCaptureUseCase';
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
    private toggleRecordOptionsUseCase: ToggleRecordOptionsUseCase,
    private startSelectionUseCase: StartSelectionUseCase,
    private startCaptureAsIsUseCase: StartCaptureAsIsUseCase,
    private enableCaptureUseCase: EnableCaptureUseCase,
    private disableCaptureUseCase: DisableCaptureUseCase,
    private changeCaptureOptionsUseCase: ChangeCaptureOptionsUseCase,
    private finishSelectionUseCase: FinishSelectionUseCase,
    private startCaptureUseCase: StartCaptureUseCase,
    private finishCaptureUseCase: FinishCaptureUseCase,
    private toggleCaptureUseCase: ToggleCaptureUseCase
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
    this.toggleRecordOptionsUseCase.execute({ recordOptions });
  };

  enableCaptureMode = () => {
    this.enableCaptureUseCase.execute();
  };

  disableCaptureMode = () => {
    this.disableCaptureUseCase.execute();
  };

  changeCaptureOptions = (options: CaptureOptions) => {
    this.changeCaptureOptionsUseCase.execute({ captureOptions: options });
  };

  startTargetSelection = () => {
    this.startSelectionUseCase.execute();
  };

  finishTargetSelection = (targetBounds: Bounds) => {
    this.finishSelectionUseCase.execute({
      targetBounds: adjustSelectionBounds(targetBounds),
    });
  };

  startCapture = () => {
    this.startCaptureUseCase.execute();
  };

  startCaptureWithCurrentStates = () => {
    this.startCaptureAsIsUseCase.execute();
  };

  finishCapture = () => {
    this.finishCaptureUseCase.execute();
  };

  onCaptureToggleShortcut = () => {
    this.toggleCaptureUseCase.execute();
  };
}
