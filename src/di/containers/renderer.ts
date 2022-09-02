import 'reflect-metadata';
// eslint-disable-next-line import/order
import { Container } from 'inversify';

import TYPES from '@di/types';

import { ActionDispatcher } from '@application/ports/action';
import { PlatformApi } from '@application/ports/platform';

import ActionDispatcherClient from '@adapters/actions/client';
import PlatformApiClient from '@adapters/platform/client';

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
