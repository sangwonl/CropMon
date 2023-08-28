import { diContainer } from '@di/containers/common';
import { TYPES } from '@di/types';

import type { UseCaseInteractor } from '@application/ports/interactor';

export const useUseCaseInteractor = (): UseCaseInteractor => {
  return diContainer.get<UseCaseInteractor>(TYPES.UseCaseInteractor);
};
