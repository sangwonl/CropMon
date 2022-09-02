import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { RecordOptions } from '@domain/models/capture';
import { Preferences } from '@domain/models/preferences';
import { PreferencesRepository } from '@domain/repositories/preferences';

import { PreferencesStore } from '@application/ports/preferences';
import HookManager from '@application/services/hook';

@injectable()
export default class PrefsRepositoryImpl implements PreferencesRepository {
  private cachedUserPrefs?: Preferences;

  public constructor(
    private hookManager: HookManager,
    @inject(TYPES.PreferencesStore) private preferencesStore: PreferencesStore
  ) {}

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

  applyRecOptionsToPrefs(prefs: Preferences, recOpts: RecordOptions) {
    if (recOpts.enableOutputAsGif !== undefined) {
      prefs.outputFormat = recOpts.enableOutputAsGif ? 'gif' : 'mp4';
    }

    if (recOpts.enableMicrophone !== undefined) {
      prefs.recordMicrophone = recOpts.enableMicrophone;
    }
  }

  getRecOptionsFromPrefs(prefs: Preferences): RecordOptions {
    return {
      enableOutputAsGif: prefs.outputFormat === 'gif',
      enableMicrophone: prefs.recordMicrophone,
    };
  }
}
