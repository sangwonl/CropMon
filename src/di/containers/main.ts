/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';

import { IUiStateApplier, StateManager } from '@core/interfaces/state';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { IPreferencesStore } from '@core/interfaces/preferences';
import { IUiDirector } from '@core/interfaces/director';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { IHookManager } from '@core/interfaces/hook';
import { IAppUpdater } from '@core/interfaces/updater';
import { AppUseCase } from '@core/usecases/app';
import { CaptureUseCase } from '@core/usecases/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { ElectronScreenRecorder } from '@infrastructures/recorder/recorder';
import { PreferencesStore } from '@infrastructures/preferences';
import { GoogleAnalyticsTracker } from '@infrastructures/tracker';
import { ActionDispatcherProxy } from '@adapters/actions/proxy';
import { HookManager, BuiltinHooks } from '@infrastructures/hook';
import { AppUpdater } from '@infrastructures/updater';
import { UiDirector } from '@infrastructures/director';
import { UiStateApplier } from '@infrastructures/state';
import { ActionDispatcher } from '@adapters/actions/dispatcher';
import { RemoteProxy } from '@adapters/remote/proxy';
import { IRemote } from '@adapters/remote/types';

import { TYPES } from '@di/types';

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
  .bind<IHookManager>(TYPES.HookManager)
  .to(HookManager)
  .inSingletonScope();

diContainer
  .bind<IAppUpdater>(TYPES.AppUpdater)
  .to(AppUpdater)
  .inSingletonScope();

diContainer
  .bind<IRemote>(TYPES.Remote)
  .to(RemoteProxy)
  .inSingletonScope();

diContainer
  .bind<ActionDispatcher>(ActionDispatcher)
  .toSelf()
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

diContainer
  .get<IRemote>(TYPES.Remote);

diContainer
  .get(ActionDispatcherProxy);

diContainer
  .get(BuiltinHooks);

export { diContainer };
