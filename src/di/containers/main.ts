/* eslint-disable prettier/prettier */

import { isMac } from '@utils/process';

import diContainer from '@di/containers';
import TYPES from '@di/types';

import { PreferencesRepository } from '@domain/repositories/preferences';
import CaptureSession from '@domain/services/capture';
import { RecorderSource, ScreenRecorder } from '@domain/services/recorder';

import UseCaseInteractorCore from '@application/controllers/interactor';
import { AppManager } from '@application/ports/app';
import { UiDirector } from '@application/ports/director';
import { UseCaseInteractor } from '@application/ports/interactor';
import { LicenseManager } from '@application/ports/license';
import { PlatformApi } from '@application/ports/platform';
import { PreferencesStore } from '@application/ports/preferences';
import { UiStateApplier } from '@application/ports/state';
import { AnalyticsTracker } from '@application/ports/tracker';
import { AppTray } from '@application/ports/tray';
import HookManager from '@application/services/hook';
import LicenseService from '@application/services/license';
import CaptureModeManager from '@application/services/mode';
import StateManager from '@application/services/state';
import ChangeCaptureOptionsUseCase from '@application/usecases/ChangeCaptureOptions';
import CheckLicenseUseCase from '@application/usecases/CheckLicense';
import CheckUpdateUseCase from '@application/usecases/CheckUpdate';
import CheckVersionUseCase from '@application/usecases/CheckVersion';
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
import OpenUrlUseCase from '@application/usecases/OpenUrlUseCase';
import QuitAppUseCase from '@application/usecases/QuitApp';
import RegisterLicenseUseCase from '@application/usecases/RegisterLicenseUseCase';
import SavePrefsUseCase from '@application/usecases/SavePrefsUseCase';
import SelectingTargetUseCase from '@application/usecases/SelectingTarget';
import StartCaptureUseCase from '@application/usecases/StartCapture';
import StartCaptureAsIsUseCase from '@application/usecases/StartCaptureAsIs';
import StartSelectionUseCase from '@application/usecases/StartSelection';
import ToggleCaptureUseCase from '@application/usecases/ToggleCaptureUseCase';
import UpdateAppUseCase from '@application/usecases/UpdateApp';

import ElectronAppManager from '@adapters/app';
import SecureStore from '@adapters/crypto';
import BuiltinHooks from '@adapters/hook';
import UseCaseInteractorForMain from '@adapters/interactor/main';
import SimpleLicenseManager from '@adapters/license';
import PlatformApiForMain from '@adapters/platform/main';
import ElectronPreferencesStore from '@adapters/preferences';
import ElectronScreenRecorder from '@adapters/recorder/recorder';
import PrefsRepositoryImpl from '@adapters/repositories/preferences';
import ElectronUiStateApplier from '@adapters/state';
import GoogleAnalyticsTracker from '@adapters/tracker';
import ElectronUiDirector from '@adapters/ui/director';
import MacAppTray from '@adapters/ui/widgets/tray/mac';
import WinAppTray from '@adapters/ui/widgets/tray/win';


diContainer
  .bind<ScreenRecorder>(TYPES.ScreenRecorder)
  .to(ElectronScreenRecorder)
  .inSingletonScope();

diContainer
  .bind<RecorderSource>(TYPES.RecorderSource)
  .toConstantValue(diContainer.get<RecorderSource>(TYPES.ScreenRecorder));

diContainer
  .bind<PreferencesStore>(TYPES.PreferencesStore)
  .to(ElectronPreferencesStore)
  .inSingletonScope();

diContainer
  .bind<UiDirector>(TYPES.UiDirector)
  .to(ElectronUiDirector)
  .inSingletonScope();

diContainer
  .bind<ElectronUiStateApplier>(ElectronUiStateApplier)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<UiStateApplier>(TYPES.UiStateApplier)
  .toConstantValue(diContainer.get(ElectronUiStateApplier));

diContainer
  .bind<AnalyticsTracker>(TYPES.AnalyticsTracker)
  .to(GoogleAnalyticsTracker)
  .inSingletonScope();

diContainer
  .bind<AppManager>(TYPES.AppManager)
  .to(ElectronAppManager)
  .inSingletonScope();

diContainer
  .bind<PlatformApi>(TYPES.PlatformApi)
  .to(PlatformApiForMain)
  .inSingletonScope();

diContainer
  .bind<SecureStore>(SecureStore)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<LicenseManager>(TYPES.LicenseManager)
  .to(SimpleLicenseManager)
  .inSingletonScope();

diContainer
  .bind<PreferencesRepository>(TYPES.PreferencesRepository)
  .to(PrefsRepositoryImpl)
  .inSingletonScope();

diContainer
  .bind<UseCaseInteractor>(TYPES.UseCaseInteractor)
  .to(UseCaseInteractorCore)
  .inSingletonScope();

diContainer
  .bind<UseCaseInteractorForMain>(UseCaseInteractorForMain)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<StateManager>(StateManager)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<HookManager>(HookManager)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<CaptureModeManager>(CaptureModeManager)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<LicenseService>(LicenseService)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<CaptureSession>(CaptureSession)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<BuiltinHooks>(BuiltinHooks)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<InitializeAppUseCase>(InitializeAppUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<QuitAppUseCase>(QuitAppUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<CheckLicenseUseCase>(CheckLicenseUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<CheckUpdateUseCase>(CheckUpdateUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<UpdateAppUseCase>(UpdateAppUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<CheckVersionUseCase>(CheckVersionUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<OpenAboutPopupUseCase>(OpenAboutPopupUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<OpenHelpPopupUseCase>(OpenHelpPopupUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<OpenPrefsModalUseCase>(OpenPrefsModalUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<OpenCaptureFolderUseCase>(OpenCaptureFolderUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<StartSelectionUseCase>(StartSelectionUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<SelectingTargetUseCase>(SelectingTargetUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<StartCaptureAsIsUseCase>(StartCaptureAsIsUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<EnableCaptureUseCase>(EnableCaptureUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<DisableCaptureUseCase>(DisableCaptureUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<ChangeCaptureOptionsUseCase>(ChangeCaptureOptionsUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<FinishSelectionUseCase>(FinishSelectionUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<StartCaptureUseCase>(StartCaptureUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<FinishCaptureUseCase>(FinishCaptureUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<ToggleCaptureUseCase>(ToggleCaptureUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<GetUiStateUseCase>(GetUiStateUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<SavePrefsUseCase>(SavePrefsUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<GetLicenseUseCase>(GetLicenseUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<RegisterLicenseUseCase>(RegisterLicenseUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<OpenUrlUseCase>(OpenUrlUseCase)
  .toSelf()
  .inSingletonScope();

if (isMac()) {
  diContainer
    .bind<AppTray>(TYPES.AppTray)
    .to(MacAppTray)
    .inSingletonScope();
} else {
  diContainer
    .bind<AppTray>(TYPES.AppTray)
    .to(WinAppTray)
    .inSingletonScope();
}

export default diContainer;
