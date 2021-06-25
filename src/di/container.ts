/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';

import { StateManager } from '@core/interfaces/state';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { IPreferencesStore } from '@core/interfaces/preferences';
import { IUiDirector } from '@core/interfaces/ui';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { IHookManager } from '@core/interfaces/hook';
import { CaptureUseCase } from '@core/usecases/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { ElectronScreenRecorder } from '@infrastructures/recorder/recorder';
import { PreferencesStore } from '@infrastructures/preferences';
import { GoogleAnalyticsTracker } from '@infrastructures/tracker';
import { HookManager } from '@infrastructures/hook';
import { AppUpdater } from '@infrastructures/updater';
import { UiDirector } from '@infrastructures/director';
import { ActionDispatcher } from '@adapters/action';

import { TYPES } from './types';

const diContainer = new Container();

diContainer
  .bind<StateManager>(StateManager)
  .toSelf()
  .inSingletonScope();

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
  .bind<IAnalyticsTracker>(TYPES.AnalyticsTracker)
  .to(GoogleAnalyticsTracker)
  .inSingletonScope();

diContainer
  .bind<IHookManager>(TYPES.HookManager)
  .to(HookManager)
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
  .bind<AppUpdater>(AppUpdater)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<ActionDispatcher>(ActionDispatcher)
  .toSelf()
  .inSingletonScope();

export { diContainer };
