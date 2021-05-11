/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';

import { IGlobalRegistry, IScreenRecorder, IPreferencesStore } from '@core/components';
import { CaptureUseCase } from '@core/usecases/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { ScreenRecorderWindows } from '@infrastructures/components/recorder-win';
import { ScreenRecorderMac } from '@infrastructures/components/recorder-mac';
import { PreferencesStoreImpl } from '@infrastructures/components/preferences';
import { UiDirector } from '@presenters/interactor/director';
import { isMac } from '@utils/process';

import { TYPES } from './types';

const diContainer = new Container();

diContainer
  .bind<IGlobalRegistry>(IGlobalRegistry)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<IScreenRecorder>(TYPES.ScreenRecorder)
  .to(isMac() ? ScreenRecorderMac : ScreenRecorderWindows)
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
  .bind<UiDirector>(TYPES.UiDirector)
  .to(UiDirector)
  .inSingletonScope();

export { diContainer };
