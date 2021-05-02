/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';

import { GlobalRegistry, ScreenRecorder, PreferencesStore } from '@core/components';
import { CaptureUseCase } from '@core/usecases/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { ScreenRecorderWindows } from '@infrastructures/components/recorder-win';
import { PreferencesStoreImpl } from '@infrastructures/components/preferences';
import { UiDirector } from '@presenters/interactor';
import { UiDirectorWindows } from '@presenters/interactor/director-win';

import { TYPES } from './types';

const diContainer = new Container();

diContainer
  .bind<GlobalRegistry>(GlobalRegistry)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<ScreenRecorder>(TYPES.ScreenRecorder)
  .to(ScreenRecorderWindows)
  .inSingletonScope();

diContainer
  .bind<PreferencesStore>(TYPES.PreferencesStore)
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
  .bind<UiDirector>(TYPES.UiDirector)
  .to(UiDirectorWindows)
  .inSingletonScope();

export { diContainer };
