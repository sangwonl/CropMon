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

import CaptureUseCase from '@application/usecases/capture';
import ActionDispatcherCore from '@application/services/dispatcher';
import StateManager from '@application/services/state';
import HookManager from '@application/services/hook';
import PreferencesRepository from '@application/repositories/preferences';
import { UiDirector } from '@application/ports/director';
import { UiStateApplier } from '@application/ports/state';
import { PreferencesStore } from '@application/ports/preferences';
import { AnalyticsTracker } from '@application/ports/tracker';
import { ScreenRecorder } from '@application/ports/recorder';
import { ActionDispatcher } from '@application/ports/action';
import { AppUpdater } from '@application/ports/updater';
import { IRemote } from '@application/ports/remote';

import ActionDispatcherProxy from '@adapters/actions/proxy';
import RemoteProxy from '@adapters/remote/proxy';
import BuiltinHooks from '@adapters/hook';
import ElectronUiStateApplier from '@adapters/state';
import ElectronPreferencesStore from '@adapters/preferences';
import ElectronUiDirector from '@adapters/director';
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
  .bind<IRemote>(TYPES.Remote)
  .to(RemoteProxy).inSingletonScope();

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
  .bind<PreferencesRepository>(PreferencesRepository)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<BuiltinHooks>(BuiltinHooks)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<CaptureUseCase>(CaptureUseCase)
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

diContainer.get<IRemote>(TYPES.Remote);

diContainer.get(ActionDispatcherProxy);

diContainer.get(BuiltinHooks);

export default diContainer;
