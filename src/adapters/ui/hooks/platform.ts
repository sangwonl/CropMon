/* eslint-disable import/prefer-default-export */

import diContainer from '@di/containers/renderer';
import TYPES from '@di/types';

import { PlatformApi } from '@application/ports/platform';

export const usePlatformApi = (): PlatformApi => {
  return diContainer.get<PlatformApi>(TYPES.PlatformApi);
};