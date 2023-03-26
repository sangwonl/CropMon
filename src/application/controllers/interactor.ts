import { injectable } from 'inversify';

import { CaptureOptions } from '@domain/models/capture';
import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';
import { Bounds, Point } from '@domain/models/screen';

import { UiState } from '@application/models/ui';
import { UseCaseInteractor } from '@application/ports/interactor';
import ChangeCaptureOptionsUseCase from '@application/usecases/ChangeCaptureOptions';
import CheckUpdateUseCase from '@application/usecases/CheckUpdate';
import DisableCaptureUseCase from '@application/usecases/DisableCapture';
import EnableCaptureUseCase from '@application/usecases/EnableCapture';
import FinishCaptureUseCase from '@application/usecases/FinishCapture';
import FinishSelectionUseCase from '@application/usecases/FinishSelection';
import GetLicenseUseCase from '@application/usecases/GetLicenseUseCase';
import GetUiStateUseCase from '@application/usecases/GetUiStateUseCase';
import InitializeAppUseCase from '@application/usecases/InitializeApp';
import OpenAboutPopupUseCase from '@application/usecases/OpenAboutPopup';
import OpenCaptureFolderUseCase from '@application/usecases/OpenCaptureFolder';
import OpenHelpPopupUseCase from '@application/usecases/OpenHelpPopup';
import OpenPrefsModalUseCase from '@application/usecases/OpenPrefsModal';
import QuitAppUseCase from '@application/usecases/QuitApp';
import RegisterLicenseUseCase from '@application/usecases/RegisterLicenseUseCase';
import SavePrefsUseCase from '@application/usecases/SavePrefsUseCase';
import SelectingTargetUseCase from '@application/usecases/SelectingTarget';
import StartCaptureUseCase from '@application/usecases/StartCapture';
import StartCaptureAsIsUseCase from '@application/usecases/StartCaptureAsIs';
import StartSelectionUseCase from '@application/usecases/StartSelection';
import ToggleCaptureUseCase from '@application/usecases/ToggleCaptureUseCase';
import UpdateAppUseCase from '@application/usecases/UpdateApp';

@injectable()
export default class UseCaseInteractorCore implements UseCaseInteractor {
  constructor(
    private initializeAppUseCase: InitializeAppUseCase,
    private quitAppUseCase: QuitAppUseCase,
    private checkUpdateUseCase: CheckUpdateUseCase,
    private updateAppUseCase: UpdateAppUseCase,
    private openAboutPopupUseCase: OpenAboutPopupUseCase,
    private openHelpPopupUseCase: OpenHelpPopupUseCase,
    private openPrefsModalUseCase: OpenPrefsModalUseCase,
    private openCaptureFolderUseCase: OpenCaptureFolderUseCase,
    private startSelectionUseCase: StartSelectionUseCase,
    private selectingTargetUseCase: SelectingTargetUseCase,
    private startCaptureAsIsUseCase: StartCaptureAsIsUseCase,
    private enableCaptureUseCase: EnableCaptureUseCase,
    private disableCaptureUseCase: DisableCaptureUseCase,
    private changeCaptureOptionsUseCase: ChangeCaptureOptionsUseCase,
    private finishSelectionUseCase: FinishSelectionUseCase,
    private startCaptureUseCase: StartCaptureUseCase,
    private finishCaptureUseCase: FinishCaptureUseCase,
    private toggleCaptureUseCase: ToggleCaptureUseCase,
    private getUiStateUseCase: GetUiStateUseCase,
    private savePrefsUseCase: SavePrefsUseCase,
    private getLicenseUseCase: GetLicenseUseCase,
    private registerLicenseUseCase: RegisterLicenseUseCase
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

  openCaptureFolder = () => {
    this.openCaptureFolderUseCase.execute();
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

  startTargetSelection = (targetBounds: Bounds, cursorPosition: Point) => {
    this.startSelectionUseCase.execute({
      targetBounds,
      cursorPosition,
    });
  };

  selectingTarget = (targetBounds: Bounds, cursorPosition: Point) => {
    this.selectingTargetUseCase.execute({
      targetBounds,
      cursorPosition,
    });
  };

  finishTargetSelection = (targetBounds: Bounds) => {
    this.finishSelectionUseCase.execute({
      targetBounds,
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

  getUiState = (): UiState => {
    const ouptput = this.getUiStateUseCase.execute();
    return ouptput.uiState;
  };

  async savePreferences(prefs: Preferences): Promise<Preferences> {
    const output = await this.savePrefsUseCase.execute({ prefs });
    return output.prefs;
  }

  async getLicense(): Promise<License | null> {
    const output = await this.getLicenseUseCase.execute();
    return output.license;
  }

  async registerLicense(
    email: string,
    licenseKey: string
  ): Promise<License | null> {
    const output = await this.registerLicenseUseCase.execute({
      email,
      licenseKey,
    });
    return output.license;
  }
}