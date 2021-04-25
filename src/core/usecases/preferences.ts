/* eslint-disable no-useless-catch */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { injectable, inject } from 'inversify';
import { TYPES } from '@di/types';

import { Preferences } from '@core/entities';
import { GlobalRegistry, PreferencesStore } from '@core/components';

@injectable()
export class PreferencesUseCase {
  public constructor(
    private globalRegistry: GlobalRegistry,
    @inject(TYPES.PreferencesStore) private preferencesStore: PreferencesStore
  ) {}

  public async getUserPreferences(): Promise<Preferences> | never {
    const curUserPref = this.globalRegistry.getUserPreferences();
    if (curUserPref !== undefined) {
      return curUserPref;
    }

    // load pref from persistent storage
    // it returns new default one if no pref info in storage
    const loadedPreference = await this.preferencesStore.loadPreferences();
    this.globalRegistry.setUserPreferences(loadedPreference);

    return loadedPreference;
  }

  public async updateUserPreference(pref: Preferences): Promise<void> | never {
    await this.preferencesStore.savePreferences(pref);
    this.globalRegistry.setUserPreferences(pref);
  }
}
