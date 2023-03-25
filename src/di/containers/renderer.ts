import 'reflect-metadata';

import diContainer from '@di/containers';
import TYPES from '@di/types';

import { UseCaseInteractor } from '@application/ports/interactor';
import { PlatformApi } from '@application/ports/platform';

import UseCaseInteractorForRenderer from '@adapters/interactor/renderer';
import PlatformApiForRenderer from '@adapters/platform/renderer';

diContainer
  .bind<UseCaseInteractor>(TYPES.UseCaseInteractor)
  .to(UseCaseInteractorForRenderer)
  .inSingletonScope();

diContainer
  .bind<PlatformApi>(TYPES.PlatformApi)
  .to(PlatformApiForRenderer)
  .inSingletonScope();

export default diContainer;
