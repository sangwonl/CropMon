/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { app } from 'electron';
import Store from 'electron-store';

import { Preference } from '@core/entities';
import { PreferenceStore } from '@core/components';

const CUR_VERSION = '0.0.1';

@injectable()
export class PreferenceStoreImpl implements PreferenceStore {
  store: Store = new Store({
    name: 'config',
    fileExtension: 'json',
    accessPropertiesByDotNotation: false,
  });

  async loadPreference(): Promise<Preference> {
    const version = this.store.get('version');
    if (version !== undefined) {
      return this.mapStoreToPreference();
    }

    const newPref = this.initialPreference();
    await this.savePreference(newPref);

    return newPref;
  }

  async savePreference(pref: Preference): Promise<void> {
    this.store.set('version', CUR_VERSION);
    this.store.set('openRecordHomeDirWhenRecordCompleted', pref.openRecordHomeDirWhenRecordCompleted);
    this.store.set('recordHomeDir', pref.recordHomeDir);
  }

  private initialPreference(): Preference {
    const pref = new Preference();
    pref.openRecordHomeDirWhenRecordCompleted = true;
    pref.recordHomeDir = app.getPath('videos');
    return pref;
  }

  private mapStoreToPreference(): Preference {
    const pref = new Preference();
    pref.openRecordHomeDirWhenRecordCompleted = this.store.get('openRecordHomeDirWhenRecordCompleted') as boolean;
    pref.recordHomeDir = this.store.get('recordHomeDir') as string;
    return pref;
  }
}
