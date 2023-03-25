import { RecordOptions } from '@domain/models/capture';
import { Preferences } from '@domain/models/preferences';

export interface PreferencesRepository {
  fetchPreferences(): Promise<Preferences>;
  updatePreference(newPrefs: Preferences): Promise<void>;
  applyRecOptionsToPrefs(prefs: Preferences, recOpts: RecordOptions): void;
  getRecOptionsFromPrefs(prefs: Preferences): RecordOptions;
}
