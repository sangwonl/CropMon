import type { Preferences } from '@domain/models/preferences';

export interface PreferencesStore {
  loadPreferences(): Promise<Preferences>;
  savePreferences(prefs: Preferences): Promise<void>;
}
