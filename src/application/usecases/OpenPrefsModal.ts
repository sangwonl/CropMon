import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { Preferences } from '@domain/models/preferences';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import { UiDirector } from '@application/ports/director';
import { PreferencesStore } from '@application/ports/preferences';

@injectable()
export default class OpenPrefsModalUseCase implements UseCase {
  private cachedUserPrefs?: Preferences;

  public constructor(
    private hookManager: HookManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    @inject(TYPES.PreferencesStore) private preferencesStore: PreferencesStore
  ) {}

  async execute() {
    this.hookManager.emit('prefs-modal-opening', {});

    const prefs = await this.fetchUserPreferences();
    await this.uiDirector.openPreferencesModal(
      prefs,
      (updatedPrefs: Preferences) => {
        if (updatedPrefs !== undefined) {
          this.updateUserPreference(updatedPrefs);
        }
      }
    );
  }

  async fetchUserPreferences(): Promise<Preferences> {
    if (this.cachedUserPrefs === undefined) {
      // load pref from persistent storage
      // it returns new default one if no pref info in storage
      const loadedPrefs = await this.preferencesStore.loadPreferences();
      this.cachedUserPrefs = loadedPrefs;

      if (loadedPrefs.initialLoaded) {
        this.hookManager.emit('initial-prefs-loaded', { loadedPrefs });
      }
      this.hookManager.emit('prefs-loaded', { loadedPrefs });
    }

    return this.cachedUserPrefs;
  }

  async updateUserPreference(newPrefs: Preferences): Promise<void> {
    const prevPrefs = this.cachedUserPrefs;

    await this.preferencesStore.savePreferences(newPrefs);
    this.cachedUserPrefs = newPrefs;

    this.hookManager.emit('prefs-updated', { prevPrefs, newPrefs });
  }
}
