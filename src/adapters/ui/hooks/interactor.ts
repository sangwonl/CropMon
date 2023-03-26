/* eslint-disable import/prefer-default-export */

import diContainer from '@di/containers';
import TYPES from '@di/types';

import { UseCaseInteractor } from '@application/ports/interactor';

export const useUseCaseInteractor = (): UseCaseInteractor => {
  return diContainer.get<UseCaseInteractor>(TYPES.UseCaseInteractor);
};
