/* eslint-disable prettier/prettier */

import 'reflect-metadata';

import { Container } from 'inversify';

import TYPES from '@di/types';

import InitializeAppUseCase from '@application/usecases/InitializeApp';
import QuitAppUseCase from '@application/usecases/QuitApp';
import CheckUpdateUseCase from '@application/usecases/CheckUpdate';
import CheckVersionUseCase from '@application/usecases/CheckVersion';
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

import ActionDispatcherCore from '@application/controllers/dispatcher';
import StateManager from '@application/services/state';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/capture/mode';
import CaptureSession from '@application/services/capture/session';
import PreferencesRepository from '@application/repositories/preferences';
import { UiDirector } from '@application/ports/director';
import { UiStateApplier } from '@application/ports/state';
import { PreferencesStore } from '@application/ports/preferences';
import { AnalyticsTracker } from '@application/ports/tracker';
import { ScreenRecorder } from '@application/ports/recorder';
import { ActionDispatcher } from '@application/ports/action';
import { AppUpdater } from '@application/ports/updater';
import { PlatformApi } from '@application/ports/platform';

import ActionDispatcherProxy from '@adapters/actions/proxy';
import PlatformApiProxy from '@adapters/platform/proxy';
import BuiltinHooks from '@adapters/hook';
import ElectronUiStateApplier from '@adapters/state';
import ElectronPreferencesStore from '@adapters/preferences';
import ElectronUiDirector from '@adapters/ui/director';
import ElectronAppUpdater from '@adapters/updater';
import ElectronScreenRecorder from '@adapters/recorder/recorder';
import GoogleAnalyticsTracker from '@adapters/tracker';

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
  .bind<UiStateApplier>(TYPES.UiStateApplier)
  .to(ElectronUiStateApplier)
  .inSingletonScope();

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
  .bind<PreferencesRepository>(PreferencesRepository)
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
  .bind<ToggleRecordOptionsUseCase>(ToggleRecordOptionsUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<StartSelectionUseCase>(StartSelectionUseCase)
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

diContainer.get<PlatformApi>(TYPES.PlatformApi);

diContainer.get(ActionDispatcherProxy);

diContainer.get(BuiltinHooks);

export default diContainer;
