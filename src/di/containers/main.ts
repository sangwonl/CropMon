/* eslint-disable prettier/prettier */

import 'reflect-metadata';
// eslint-disable-next-line import/order
import { Container } from 'inversify';

import TYPES from '@di/types';

import { PreferencesRepository } from '@domain/repositories/preferences';
import CaptureSession from '@domain/services/capture';
import { ScreenRecorder } from '@domain/services/recorder';

import ActionDispatcherCore from '@application/controllers/dispatcher';
import { ActionDispatcher } from '@application/ports/action';
import { UiDirector } from '@application/ports/director';
import { PlatformApi } from '@application/ports/platform';
import { PreferencesStore } from '@application/ports/preferences';
import { UiStateApplier } from '@application/ports/state';
import { AnalyticsTracker } from '@application/ports/tracker';
import { AppUpdater } from '@application/ports/updater';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';
import StateManager from '@application/services/ui/state';
import ChangeCaptureOptionsUseCase from '@application/usecases/ChangeCaptureOptions';
import CheckUpdateUseCase from '@application/usecases/CheckUpdate';
import CheckVersionUseCase from '@application/usecases/CheckVersion';
import DisableCaptureUseCase from '@application/usecases/DisableCapture';
import EnableCaptureUseCase from '@application/usecases/EnableCapture';
import FinishCaptureUseCase from '@application/usecases/FinishCapture';
import FinishSelectionUseCase from '@application/usecases/FinishSelection';
import GetUiStateUseCase from '@application/usecases/GetUiStateUseCase';
import InitializeAppUseCase from '@application/usecases/InitializeApp';
import OpenAboutPopupUseCase from '@application/usecases/OpenAboutPopup';
import OpenCaptureFolderUseCase from '@application/usecases/OpenCaptureFolder';
import OpenHelpPopupUseCase from '@application/usecases/OpenHelpPopup';
import OpenPrefsModalUseCase from '@application/usecases/OpenPrefsModal';
import QuitAppUseCase from '@application/usecases/QuitApp';
import SelectingTargetUseCase from '@application/usecases/SelectingTarget';
import StartCaptureUseCase from '@application/usecases/StartCapture';
import StartCaptureAsIsUseCase from '@application/usecases/StartCaptureAsIs';
import StartSelectionUseCase from '@application/usecases/StartSelection';
import ToggleCaptureUseCase from '@application/usecases/ToggleCaptureUseCase';
import ToggleRecordOptionsUseCase from '@application/usecases/ToggleRecordOptions';
import UpdateAppUseCase from '@application/usecases/UpdateApp';

import ActionDispatcherProxy from '@adapters/actions/proxy';
import BuiltinHooks from '@adapters/hook';
import PlatformApiProxy from '@adapters/platform/proxy';
import ElectronPreferencesStore from '@adapters/preferences';
import ElectronScreenRecorder from '@adapters/recorder/recorder';
import PrefsRepositoryImpl from '@adapters/repositories/preferences';
import ElectronUiStateApplier from '@adapters/state';
import GoogleAnalyticsTracker from '@adapters/tracker';
import ElectronUiDirector from '@adapters/ui/director';
import ElectronAppUpdater from '@adapters/updater';

const diContainer = new Container();

diContainer
  .bind<ScreenRecorder>(TYPES.ScreenRecorder)
  .to(ElectronScreenRecorder)
  .inSingletonScope();

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
  .bind<AppUpdater>(TYPES.AppUpdater)
  .to(ElectronAppUpdater)
  .inSingletonScope();

diContainer
  .bind<PlatformApi>(TYPES.PlatformApi)
  .to(PlatformApiProxy)
  .inSingletonScope();

diContainer
  .bind<PreferencesRepository>(TYPES.PreferencesRepository)
  .to(PrefsRepositoryImpl)
  .inSingletonScope();

diContainer
  .bind<ActionDispatcher>(TYPES.ActionDispatcher)
  .to(ActionDispatcherCore)
  .inSingletonScope();

diContainer
  .bind<ActionDispatcherProxy>(ActionDispatcherProxy)
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
  .bind<ToggleRecordOptionsUseCase>(ToggleRecordOptionsUseCase)
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

diContainer.get<PlatformApi>(TYPES.PlatformApi);

diContainer.get(ActionDispatcherProxy);

diContainer.get(BuiltinHooks);

export default diContainer;
