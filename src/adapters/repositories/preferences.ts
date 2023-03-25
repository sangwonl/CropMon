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
    prefs.outputFormat = recOpts.outputAsGif ? 'gif' : 'mp4';
    prefs.recordAudio = recOpts.recordAudio;
    if (recOpts.audioSources?.length > 0) {
      prefs.audioSources = recOpts.audioSources;
    }
  }

  getRecOptionsFromPrefs(prefs: Preferences): RecordOptions {
    return {
      outputAsGif: prefs.outputFormat === 'gif',
      recordAudio: prefs.recordAudio,
      audioSources: prefs.audioSources,
    };
  }
}
