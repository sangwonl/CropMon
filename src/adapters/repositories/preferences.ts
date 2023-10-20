import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';

import type { RecordOptions } from '@domain/models/capture';
import type { Preferences } from '@domain/models/preferences';
import type { PreferencesRepository } from '@domain/repositories/preferences';

import type { PreferencesStore } from '@application/ports/preferences';
import { HookManager } from '@application/services/hook';

@injectable()
export class PrefsRepositoryImpl implements PreferencesRepository {
  private cachedUserPrefs?: Preferences;

  public constructor(
    private hookManager: HookManager,
    @inject(TYPES.PreferencesStore) private preferencesStore: PreferencesStore,
  ) {}

  async fetchPreferences(): Promise<Preferences> {
    if (this.cachedUserPrefs === undefined) {
      // load pref from persistent storage
      // it returns new default one if no pref info in storage
      const loadedPrefs = await this.preferencesStore.loadPreferences();
      this.cachedUserPrefs = loadedPrefs;

      if (loadedPrefs.initialLoaded) {
        this.hookManager.emit('onInitialPrefsLoaded', { loadedPrefs });
      }
      this.hookManager.emit('onPrefsLoaded', { loadedPrefs });
    }

    return this.cachedUserPrefs;
  }

  async updatePreference(newPrefs: Preferences): Promise<void> {
    const prevPrefs = this.cachedUserPrefs;

    await this.preferencesStore.savePreferences(newPrefs);
    this.cachedUserPrefs = newPrefs;

    this.hookManager.emit('onPrefsUpdated', { prevPrefs, newPrefs });
  }

  applyRecOptionsToPrefs(prefs: Preferences, recOpts: RecordOptions) {
    prefs.outputFormat = recOpts.outputFormat;
    prefs.recordAudio = recOpts.recordAudio;
    if (recOpts.audioSources?.length > 0) {
      prefs.audioSources = recOpts.audioSources;
    }
  }

  getRecOptionsFromPrefs(prefs: Preferences): RecordOptions {
    return {
      outputFormat: prefs.outputFormat,
      recordAudio: prefs.recordAudio,
      audioSources: prefs.audioSources,
    };
  }
}
