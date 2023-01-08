import 'reflect-metadata';

import diContainer from '@di/containers';
import TYPES from '@di/types';

import { ActionDispatcher } from '@application/ports/action';
import { PlatformApi } from '@application/ports/platform';

import ActionDispatcherForRenderer from '@adapters/actions/renderer';
import PlatformApiForRenderer from '@adapters/platform/renderer';

diContainer
  .bind<ActionDispatcher>(TYPES.ActionDispatcher)
  .to(ActionDispatcherForRenderer)
  .inSingletonScope();

diContainer
  .bind<PlatformApi>(TYPES.PlatformApi)
  .to(PlatformApiForRenderer)
  .inSingletonScope();

export default diContainer;
