/* eslint-disable import/prefer-default-export */

import { diContainer } from '@di/containers/renderer';
import { TYPES } from '@di/types';
import { IRemote } from '@adapters/remote/types';

export const useRemote = (): IRemote => {
  return diContainer.get<IRemote>(TYPES.Remote);
};
