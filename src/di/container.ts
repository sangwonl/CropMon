/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';

import { GlobalRegistry, ScreenRecorder, PreferenceStore } from '@core/components';
import { CaptureUseCase } from '@core/usecases/capture';
import { PreferenceUseCase } from '@core/usecases/preference';
import { ScreenRecorderWindows } from '@infrastructures/components/recorder-win';
import { PreferenceStoreImpl } from '@infrastructures/components/preference';
import { UiDirector } from '@presenters/interactor';

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
  .bind<PreferenceStore>(TYPES.PreferenceStore)
  .to(PreferenceStoreImpl)
  .inSingletonScope();

diContainer
  .bind<CaptureUseCase>(CaptureUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<PreferenceUseCase>(PreferenceUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<UiDirector>(UiDirector)
  .toSelf()
  .inSingletonScope();

export { diContainer };
