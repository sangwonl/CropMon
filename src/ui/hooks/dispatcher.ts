/* eslint-disable import/prefer-default-export */

import { diContainer } from '@di/containers/renderer';
import { TYPES } from '@di/types';
import { IActionDispatcher } from '@adapters/actions/types';

export const useActionDispatcher = (): IActionDispatcher => {
  return diContainer.get<IActionDispatcher>(TYPES.ActionDispatcher);
};
