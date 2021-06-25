/* eslint-disable no-useless-catch */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { injectable, inject } from 'inversify';

import { TYPES } from '@di/types';
import { IPreferences } from '@core/entities/preferences';
import { IPreferencesStore } from '@core/interfaces/preferences';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { IHookManager } from '@core/interfaces/hook';

@injectable()
export class PreferencesUseCase {
  private cachedUserPrefs: IPreferences | undefined;

  public constructor(
    @inject(TYPES.PreferencesStore) private preferencesStore: IPreferencesStore,
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker,
    @inject(TYPES.HookManager) private hookManager: IHookManager
  ) {}

  async fetchUserPreferences(): Promise<IPreferences> {
    if (this.cachedUserPrefs === undefined) {
      // load pref from persistent storage
      // it returns new default one if no pref info in storage
      this.cachedUserPrefs = await this.preferencesStore.loadPreferences();
      this.hookManager.emit('after-preferences-loaded');
    }

    return this.cachedUserPrefs;
  }

  async updateUserPreference(prefs: IPreferences): Promise<void> {
    await this.preferencesStore.savePreferences(prefs);

    this.cachedUserPrefs = prefs;
    this.hookManager.emit('after-preferences-updated');

    // TODO: Try to move this to hook
    this.tracker.eventL('prefs', 'update-prefs', JSON.stringify(prefs));
  }
}
