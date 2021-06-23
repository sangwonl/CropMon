/* eslint-disable no-useless-catch */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { injectable, inject } from 'inversify';
import { TYPES } from '@di/types';

import { IPreferences } from '@core/entities/preferences';
import { GlobalRegistry } from '@core/components/registry';
import { IPreferencesStore } from '@core/components/preferences';
import { IAnalyticsTracker } from '@core/components/tracker';
import { IHookManager } from '@core/components/hook';

@injectable()
export class PreferencesUseCase {
  public constructor(
    private globalRegistry: GlobalRegistry,
    @inject(TYPES.PreferencesStore) private preferencesStore: IPreferencesStore,
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker,
    @inject(TYPES.HookManager) private hookManager: IHookManager
  ) {}

  getUserPreferences = async (): Promise<IPreferences> => {
    const curUserPrefs = this.globalRegistry.getUserPreferences();
    if (curUserPrefs !== undefined) {
      return curUserPrefs;
    }

    // load pref from persistent storage
    // it returns new default one if no pref info in storage
    const loadedPrefs = await this.preferencesStore.loadPreferences();
    this.globalRegistry.setUserPreferences(loadedPrefs);
    this.hookManager.emit('after-preferences-loaded');

    return loadedPrefs;
  };

  updateUserPreference = async (prefs: IPreferences): Promise<void> => {
    await this.preferencesStore.savePreferences(prefs);
    this.globalRegistry.setUserPreferences(prefs);
    this.hookManager.emit('after-preferences-updated');

    // TODO: Try to move this to hook
    this.tracker.eventL('prefs', 'update-prefs', JSON.stringify(prefs));
  };
}
