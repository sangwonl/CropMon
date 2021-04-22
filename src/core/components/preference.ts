/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { Preference } from '@core/entities';

export interface PreferenceStore {
  loadPreference(): Promise<Preference>;
  savePreference(preference: Preference): Promise<void>;
}
