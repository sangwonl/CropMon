/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';

import { GlobalRegistry, ScreenRecorder } from '@core/components';
import { CaptureUseCase } from '@core/usecases/capture';
import { ScreenRecorderWindows } from '@infrastructures/components/recorder-win';
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
  .bind<CaptureUseCase>(CaptureUseCase)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<UiDirector>(UiDirector)
  .toSelf()
  .inSingletonScope();

export { diContainer };
