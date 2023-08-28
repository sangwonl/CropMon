import 'reflect-metadata';

import { diContainer } from '@di/containers/common';
import { TYPES } from '@di/types';

import type { UseCaseInteractor } from '@application/ports/interactor';
import type { PlatformApi } from '@application/ports/platform';

import { UseCaseInteractorForRenderer } from '@adapters/interactor/renderer';
import { PlatformApiForRenderer } from '@adapters/platform/renderer';

diContainer
  .bind<UseCaseInteractor>(TYPES.UseCaseInteractor)
  .to(UseCaseInteractorForRenderer)
  .inSingletonScope();

diContainer
  .bind<PlatformApi>(TYPES.PlatformApi)
  .to(PlatformApiForRenderer)
  .inSingletonScope();

export { diContainer };
