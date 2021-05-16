/* eslint-disable no-useless-catch */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { injectable, inject } from 'inversify';
import { TYPES } from '@di/types';

import { IPreferences } from '@core/entities/preferences';
import { GlobalRegistry } from '@core/components/registry';
import { IPreferencesStore } from '@core/components/preferences';
import { IAnalyticsTracker } from '@core/components/tracker';

@injectable()
export class PreferencesUseCase {
  public constructor(
    private globalRegistry: GlobalRegistry,
    @inject(TYPES.PreferencesStore) private preferencesStore: IPreferencesStore,
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker
  ) {}

  public async getUserPreferences(): Promise<IPreferences> | never {
    const curUserPrefs = this.globalRegistry.getUserPreferences();
    if (curUserPrefs !== undefined) {
      return curUserPrefs;
    }

    // load pref from persistent storage
    // it returns new default one if no pref info in storage
    const loadedPrefs = await this.preferencesStore.loadPreferences();
    this.globalRegistry.setUserPreferences(loadedPrefs);

    return loadedPrefs;
  }

  public async updateUserPreference(
    prefs: IPreferences
  ): Promise<void> | never {
    await this.preferencesStore.savePreferences(prefs);
    this.globalRegistry.setUserPreferences(prefs);
    this.tracker.eventL('prefs', 'update-prefs', JSON.stringify(prefs));
  }
}
