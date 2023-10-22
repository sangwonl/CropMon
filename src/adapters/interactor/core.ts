/* eslint-disable no-unused-vars */

import { injectable } from 'inversify';

import type { CaptureOptions } from '@domain/models/capture';
import type { Preferences } from '@domain/models/preferences';
import type { Bounds, Point } from '@domain/models/screen';

import type { UiState } from '@application/models/ui';
import type { UseCaseInteractor } from '@application/ports/interactor';
import { ChangeCaptureOptionsUseCase } from '@application/usecases/ChangeCaptureOptions';
import { CheckUpdateUseCase } from '@application/usecases/CheckUpdate';
import { DisableCaptureUseCase } from '@application/usecases/DisableCapture';
import { EnableCaptureUseCase } from '@application/usecases/EnableCapture';
import { FinishCaptureUseCase } from '@application/usecases/FinishCapture';
import { FinishSelectionUseCase } from '@application/usecases/FinishSelection';
import { GetUiStateUseCase } from '@application/usecases/GetUiState';
import { InitializeAppUseCase } from '@application/usecases/InitializeApp';
import { OpenCaptureFolderUseCase } from '@application/usecases/OpenCaptureFolder';
import { OpenPrefsModalUseCase } from '@application/usecases/OpenPrefsModal';
import { OpenUrlUseCase } from '@application/usecases/OpenUrl';
import { QuitAppUseCase } from '@application/usecases/QuitApp';
import { SavePrefsUseCase } from '@application/usecases/SavePrefs';
import { SelectingTargetUseCase } from '@application/usecases/SelectingTarget';
import { StartCaptureUseCase } from '@application/usecases/StartCapture';
import { StartCaptureAsIsUseCase } from '@application/usecases/StartCaptureAsIs';
import { StartSelectionUseCase } from '@application/usecases/StartSelection';
import { ToggleCaptureUseCase } from '@application/usecases/ToggleCapture';
import { UpdateAppUseCase } from '@application/usecases/UpdateApp';

@injectable()
export class UseCaseInteractorCore implements UseCaseInteractor {
  constructor(
    private initializeAppUseCase: InitializeAppUseCase,
    private quitAppUseCase: QuitAppUseCase,
    private checkUpdateUseCase: CheckUpdateUseCase,
    private updateAppUseCase: UpdateAppUseCase,
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
    private openUrlUseCase: OpenUrlUseCase,
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

  openExternal(url: string): void {
    this.openUrlUseCase.execute({ url });
  }
}
