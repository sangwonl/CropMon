/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { Preferences } from '@core/entities';

export interface PreferencesStore {
  loadPreferences(): Promise<Preferences>;
  savePreferences(preferences: Preferences): Promise<void>;
}
