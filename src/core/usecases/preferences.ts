/* eslint-disable no-useless-catch */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { injectable, inject } from 'inversify';

import { TYPES } from '@di/types';
import { IPreferences } from '@core/entities/preferences';
import { IPreferencesStore } from '@core/interfaces/preferences';
import { IHookManager } from '@core/interfaces/hook';
import { IUiDirector } from '@core/interfaces/director';

@injectable()
export class PreferencesUseCase {
  private cachedUserPrefs: IPreferences | undefined;

  public constructor(
    @inject(TYPES.PreferencesStore) private preferencesStore: IPreferencesStore,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
    @inject(TYPES.HookManager) private hookManager: IHookManager
  ) {}

  async openPreferencesModal(): Promise<void> {
    const prefs = await this.fetchUserPreferences();
    const updatedPrefs = await this.uiDirector.openPreferencesModal(prefs);
    if (updatedPrefs !== undefined) {
      this.updateUserPreference(updatedPrefs);
    }
  }

  async fetchUserPreferences(): Promise<IPreferences> {
    if (this.cachedUserPrefs === undefined) {
      // load pref from persistent storage
      // it returns new default one if no pref info in storage
      const loadedPrefs = await this.preferencesStore.loadPreferences();
      this.cachedUserPrefs = loadedPrefs;

      this.hookManager.emit('after-prefs-loaded', { loadedPrefs });
    }

    return this.cachedUserPrefs;
  }

  async updateUserPreference(newPrefs: IPreferences): Promise<void> {
    const prevPrefs = this.cachedUserPrefs;

    await this.preferencesStore.savePreferences(newPrefs);
    this.cachedUserPrefs = newPrefs;

    this.hookManager.emit('after-prefs-updated', { prevPrefs, newPrefs });
  }
}
