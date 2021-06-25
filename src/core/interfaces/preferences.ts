/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { IPreferences } from '@core/entities/preferences';

export interface IPreferencesStore {
  loadPreferences(): Promise<IPreferences>;
  savePreferences(preferences: IPreferences): Promise<void>;
}
