import { RecordOptions } from '@domain/models/capture';
import { Preferences } from '@domain/models/preferences';

export interface PreferencesRepository {
  fetchUserPreferences(): Promise<Preferences>;
  updateUserPreference(newPrefs: Preferences): Promise<void>;
  applyRecOptionsToPrefs(prefs: Preferences, recOpts: RecordOptions): void;
  getRecOptionsFromPrefs(prefs: Preferences): RecordOptions;
}
