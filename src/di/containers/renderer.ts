/* eslint-disable prettier/prettier */

import 'reflect-metadata';

import { Container } from 'inversify';

import TYPES from '@di/types';
import { IRemote } from '@adapters/remote/types';
import RemoteClient from '@adapters/remote/client';
import { IActionDispatcher } from '@adapters/actions/types';
import ActionDispatcherClient from '@adapters/actions/client';

const diContainer = new Container();

diContainer
  .bind<IActionDispatcher>(TYPES.ActionDispatcher)
  .to(ActionDispatcherClient)
  .inSingletonScope();

diContainer
  .bind<IRemote>(TYPES.Remote)
  .to(RemoteClient)
  .inSingletonScope();

export default diContainer;
