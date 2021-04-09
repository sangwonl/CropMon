/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';
import { TYPES } from './types';

import { CommandDispatcher, ScreenRecorder } from '../core/components';
import { CommandDispatcherImpl } from '../infrastructures/components/command';
import { CaptureUseCase } from '../core/usecases/capture';
import { ScreenRecorderImpl } from '../infrastructures/components/recorder';

const diContainer = new Container();

diContainer
  .bind<CommandDispatcher>(TYPES.CommandDispatcher)
  .to(CommandDispatcherImpl)
  .inSingletonScope();

diContainer
  .bind<ScreenRecorder>(TYPES.ScreenRecorder)
  .to(ScreenRecorderImpl)
  .inSingletonScope();

// eslint-disable-next-line prettier/prettier
diContainer
  .bind<CaptureUseCase>(CaptureUseCase)
  .toSelf()
  .inSingletonScope();

export { diContainer };
