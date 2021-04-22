/* eslint-disable no-useless-catch */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { injectable, inject } from 'inversify';
import { TYPES } from '@di/types';

import { Preference } from '@core/entities';
import { GlobalRegistry, PreferenceStore } from '@core/components';

@injectable()
export class PreferenceUseCase {
  public constructor(
    private globalRegistry: GlobalRegistry,
    @inject(TYPES.PreferenceStore) private preferenceStore: PreferenceStore
  ) {}

  public async getUserPreference(): Promise<Preference> | never {
    const curUserPref = this.globalRegistry.getUserPreference();
    if (curUserPref !== undefined) {
      return curUserPref;
    }

    // load pref from persistent storage
    // it returns new default one if no pref info in storage
    const loadedPreference = await this.preferenceStore.loadPreference();
    this.globalRegistry.setUserPreference(loadedPreference);

    return loadedPreference;
  }

  public async updateUserPreference(pref: Preference): Promise<void> | never {
    await this.preferenceStore.savePreference(pref);
    this.globalRegistry.setUserPreference(pref);
  }
}
