/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';

import { TYPES } from '@di/types';
import { ActionDispatcherClient } from '@adapters/actions/client';
import { IRemote } from '@adapters/remote/types';
import { RemoteClient } from '@adapters/remote/client';

const diContainer = new Container();

diContainer
  .bind<ActionDispatcherClient>(ActionDispatcherClient)
  .toSelf()
  .inSingletonScope();

diContainer
  .bind<IRemote>(TYPES.Remote)
  .to(RemoteClient)
  .inSingletonScope();

export { diContainer };
