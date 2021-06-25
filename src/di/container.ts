/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';

import { StateManager } from '@core/components/state';
import { IScreenRecorder } from '@core/components/recorder';
import { IPreferencesStore } from '@core/components/preferences';
import { IUiDirector } from '@core/components/ui';
import { IAnalyticsTracker } from '@core/components/tracker';
import { IHookManager } from '@core/components/hook';
import { CaptureUseCase } from '@core/usecases/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { ElectronScreenRecorder } from '@infrastructures/recorder/recorder';
import { PreferencesStore } from '@infrastructures/preferences';
import { GoogleAnalyticsTracker } from '@infrastructures/ga-tracker';
import { HookManager } from '@infrastructures/hook';
import { AppUpdater } from '@presenters/interactor/updater';
import { UiDirector } from '@presenters/interactor/director';
import { ActionDispatcher } from '@presenters/interactor/action';

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
