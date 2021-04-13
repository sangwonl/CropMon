/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';
import { TYPES } from './types';

import { GlobalRegistry, ScreenRecorder } from '../core/components';
import { CaptureUseCase } from '../core/usecases/capture';
import { ScreenRecorderWindows } from '../infrastructures/components/recorder-win';

const diContainer = new Container();

// eslint-disable-next-line prettier/prettier
diContainer
  .bind<GlobalRegistry>(GlobalRegistry)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<ScreenRecorder>(TYPES.ScreenRecorder)
  .to(ScreenRecorderWindows)
  .inSingletonScope();

// eslint-disable-next-line prettier/prettier
diContainer
  .bind<CaptureUseCase>(CaptureUseCase)
  .toSelf()
  .inSingletonScope();

export { diContainer };
