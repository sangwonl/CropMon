/* eslint-disable import/prefer-default-export */

import { diContainer } from '@di/containers/renderer';
import { IActionDispatcher } from '@adapters/actions/types';
import { ActionDispatcherClient } from '@adapters/actions/client';

export const useActionDispatcher = (): IActionDispatcher => {
  return diContainer.get(ActionDispatcherClient);
};
