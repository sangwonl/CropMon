/* eslint-disable import/prefer-default-export */

import diContainer from '@di/containers';
import TYPES from '@di/types';

import { ActionDispatcher } from '@application/ports/action';

export const useActionDispatcher = (): ActionDispatcher => {
  return diContainer.get<ActionDispatcher>(TYPES.ActionDispatcher);
};
