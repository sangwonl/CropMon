/* eslint-disable prettier/prettier */

import 'reflect-metadata';

import { Container } from 'inversify';

import TYPES from '@di/types';

import { IRemote } from '@application/ports/remote';
import { ActionDispatcher } from '@application/ports/action';

import RemoteClient from '@adapters/remote/client';
import ActionDispatcherClient from '@adapters/actions/client';

const diContainer = new Container();

diContainer
  .bind<ActionDispatcher>(TYPES.ActionDispatcher)
  .to(ActionDispatcherClient)
  .inSingletonScope();

diContainer
  .bind<IRemote>(TYPES.Remote)
  .to(RemoteClient)
  .inSingletonScope();

export default diContainer;
