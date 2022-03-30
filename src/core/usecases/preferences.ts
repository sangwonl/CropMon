import { injectable, inject } from 'inversify';

import TYPES from '@di/types';
import { IPreferences } from '@core/entities/preferences';
import { IRecordOptions } from '@core/entities/capture';
import { IPreferencesStore } from '@core/services/preferences';
import HookManager from '@core/services/hook';
import { IUiDirector } from '@core/services/director';

@injectable()
export default class PreferencesUseCase {
  private cachedUserPrefs?: IPreferences;

  public constructor(
    @inject(TYPES.PreferencesStore) private preferencesStore: IPreferencesStore,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
    private hookManager: HookManager
  ) {}

  async openPreferencesModal(): Promise<void> {
    this.hookManager.emit('prefs-modal-opening', {});

    const prefs = await this.fetchUserPreferences();
    await this.uiDirector.openPreferencesModal(
      prefs,
      (updatedPrefs: IPreferences) => {
        if (updatedPrefs !== undefined) {
          this.updateUserPreference(updatedPrefs);
        }
      }
    );
  }

  async fetchUserPreferences(): Promise<IPreferences> {
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

  async updateUserPreference(newPrefs: IPreferences): Promise<void> {
    const prevPrefs = this.cachedUserPrefs;

    await this.preferencesStore.savePreferences(newPrefs);
    this.cachedUserPrefs = newPrefs;

    this.hookManager.emit('prefs-updated', { prevPrefs, newPrefs });
  }

  applyRecOptionsToPrefs = (prefs: IPreferences, recOpts: IRecordOptions) => {
    if (recOpts.enableLowQualityMode !== undefined) {
      prefs.recordQualityMode = recOpts.enableLowQualityMode ? 'low' : 'normal';
    }

    if (recOpts.enableOutputAsGif !== undefined) {
      prefs.outputFormat = recOpts.enableOutputAsGif ? 'gif' : 'mp4';
    }

    if (recOpts.enableMicrophone !== undefined) {
      prefs.recordMicrophone = recOpts.enableMicrophone;
    }
  };

  getRecOptionsFromPrefs = (prefs: IPreferences): IRecordOptions => {
    return {
      enableOutputAsGif: prefs.outputFormat === 'gif',
      enableLowQualityMode: prefs.recordQualityMode === 'low',
      enableMicrophone: prefs.recordMicrophone,
    };
  };
}
