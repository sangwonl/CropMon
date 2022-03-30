/* eslint-disable prettier/prettier */

import 'reflect-metadata';

import { Container } from 'inversify';

import TYPES from '@di/types';
import { IUiStateApplier, StateManager } from '@core/services/state';
import { IScreenRecorder } from '@core/services/recorder';
import { IPreferencesStore } from '@core/services/preferences';
import { IUiDirector } from '@core/services/director';
import { IAnalyticsTracker } from '@core/services/tracker';
import { IAppUpdater } from '@core/services/updater';
import HookManager from '@core/services/hook';
import AppUseCase from '@core/usecases/app';
import CaptureUseCase from '@core/usecases/capture';
import PreferencesUseCase from '@core/usecases/preferences';
import ElectronScreenRecorder from '@infrastructures/recorder/recorder';
import PreferencesStore from '@infrastructures/preferences';
import GoogleAnalyticsTracker from '@infrastructures/tracker';
import AppUpdater from '@infrastructures/updater';
import UiDirector from '@infrastructures/director';
import UiStateApplier from '@infrastructures/state';
import BuiltinHooks from '@infrastructures/hook/builtin';
import { IActionDispatcher } from '@adapters/actions/types';
import ActionDispatcher from '@adapters/actions/dispatcher';
import ActionDispatcherProxy from '@adapters/actions/proxy';
import { IRemote } from '@adapters/remote/types';
import RemoteProxy from '@adapters/remote/proxy';

const diContainer = new Container();

diContainer
  .bind<IScreenRecorder>(TYPES.ScreenRecorder)
  .to(ElectronScreenRecorder)
  .inSingletonScope();

diContainer
  .bind<IPreferencesStore>(TYPES.PreferencesStore)
  .to(PreferencesStore)
  .inSingletonScope();

diContainer
  .bind<IUiDirector>(TYPES.UiDirector)
  .to(UiDirector)
  .inSingletonScope();

diContainer
  .bind<IUiStateApplier>(TYPES.UiStateApplier)
  .to(UiStateApplier)
  .inSingletonScope();

diContainer
  .bind<IAnalyticsTracker>(TYPES.AnalyticsTracker)
  .to(GoogleAnalyticsTracker)
  .inSingletonScope();

diContainer
  .bind<IAppUpdater>(TYPES.AppUpdater)
  .to(AppUpdater)
  .inSingletonScope();

diContainer
  .bind<IRemote>(TYPES.Remote)
  .to(RemoteProxy).inSingletonScope();

diContainer
  .bind<IActionDispatcher>(TYPES.ActionDispatcher)
  .to(ActionDispatcher)
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
  .bind<BuiltinHooks>(BuiltinHooks)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<AppUseCase>(AppUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<CaptureUseCase>(CaptureUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<PreferencesUseCase>(PreferencesUseCase)
  .toSelf()
  .inSingletonScope();

diContainer.get<IRemote>(TYPES.Remote);

diContainer.get(ActionDispatcherProxy);

diContainer.get(BuiltinHooks);

export default diContainer;
