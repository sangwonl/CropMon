/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { app } from 'electron';
import Store from 'electron-store';

import { Preferences } from '@core/entities';
import { PreferencesStore } from '@core/components';

const CUR_VERSION = '0.0.1';

@injectable()
export class PreferencesStoreImpl implements PreferencesStore {
  store: Store = new Store({
    name: 'config',
    fileExtension: 'json',
    accessPropertiesByDotNotation: false,
  });

  async loadPreferences(): Promise<Preferences> {
    const version = this.store.get('version');
    if (version !== undefined) {
      return this.mapStoreToPreferences();
    }

    const newPrefs = this.initialPreferences();
    await this.savePreferences(newPrefs);

    return newPrefs;
  }

  async savePreferences(pref: Preferences): Promise<void> {
    this.store.set('version', CUR_VERSION);
    this.store.set('openRecordHomeDirWhenRecordCompleted', pref.openRecordHomeDirWhenRecordCompleted);
    this.store.set('recordHomeDir', pref.recordHomeDir);
  }

  private initialPreferences(): Preferences {
    const prefs = new Preferences();
    prefs.openRecordHomeDirWhenRecordCompleted = true;
    prefs.recordHomeDir = app.getPath('videos');
    return prefs;
  }

  private mapStoreToPreferences(): Preferences {
    const prefs = new Preferences();
    prefs.openRecordHomeDirWhenRecordCompleted = this.store.get('openRecordHomeDirWhenRecordCompleted') as boolean;
    prefs.recordHomeDir = this.store.get('recordHomeDir') as string;
    return prefs;
  }
}
