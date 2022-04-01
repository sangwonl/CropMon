/* eslint-disable prettier/prettier */

import 'reflect-metadata';

import { Container } from 'inversify';

import TYPES from '@di/types';

import { PlatformApi } from '@application/ports/platform';
import { ActionDispatcher } from '@application/ports/action';

import PlatformApiClient from '@adapters/platform/client';
import ActionDispatcherClient from '@adapters/actions/client';

const diContainer = new Container();

diContainer
  .bind<ActionDispatcher>(TYPES.ActionDispatcher)
  .to(ActionDispatcherClient)
  .inSingletonScope();

diContainer
  .bind<PlatformApi>(TYPES.PlatformApi)
  .to(PlatformApiClient)
  .inSingletonScope();

export default diContainer;
