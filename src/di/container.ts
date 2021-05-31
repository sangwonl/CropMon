/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';

import { GlobalRegistry } from '@core/components/registry';
import { IScreenRecorder } from '@core/components/recorder';
import { IPreferencesStore } from '@core/components/preferences';
import { IAnalyticsTracker } from '@core/components/tracker';
import { CaptureUseCase } from '@core/usecases/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { ElectronScreenRecorder } from '@infrastructures/components/electron-recorder/recorder';
import { PreferencesStoreImpl } from '@infrastructures/components/preferences';
import { GoogleAnalyticsTracker } from '@infrastructures/components/ga-tracker';
import { AppUpdater } from '@infrastructures/components/updater';
import { UiDirector } from '@presenters/interactor/director';

import { TYPES } from './types';

const diContainer = new Container();

diContainer
  .bind<GlobalRegistry>(GlobalRegistry)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<IScreenRecorder>(TYPES.ScreenRecorder)
  .to(ElectronScreenRecorder)
  .inSingletonScope();

diContainer
  .bind<IPreferencesStore>(TYPES.PreferencesStore)
  .to(PreferencesStoreImpl)
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
  .bind<UiDirector>(UiDirector)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<AppUpdater>(AppUpdater)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<IAnalyticsTracker>(TYPES.AnalyticsTracker)
  .to(GoogleAnalyticsTracker)
  .inSingletonScope();

export { diContainer };
