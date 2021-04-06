/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { Container } from 'inversify';
import { TYPES } from './types';

import { CommandDispatcher } from '../../core/components';
import { CommandDispatcherImpl } from '../components/command';

export const diContainer = new Container();

export const initializeDiContainer = () => {
  diContainer
    .bind<CommandDispatcher>(TYPES.CommandDispatcher)
    .to(CommandDispatcherImpl);
};
