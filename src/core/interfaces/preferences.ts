import { IPreferences } from '@core/entities/preferences';

export interface IPreferencesStore {
  loadPreferences(): Promise<IPreferences>;
  savePreferences(preferences: IPreferences): Promise<void>;
}
