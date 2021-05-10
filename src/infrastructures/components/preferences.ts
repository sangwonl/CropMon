/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { app } from 'electron';
import Store from 'electron-store';

import { IPreferences } from '@core/entities/preferences';
import { IPreferencesStore } from '@core/components';

const CUR_VERSION = '0.0.1';

@injectable()
export class PreferencesStoreImpl implements IPreferencesStore {
  store: Store = new Store({
    name: 'config',
    fileExtension: 'json',
    accessPropertiesByDotNotation: false,
  });

  async loadPreferences(): Promise<IPreferences> {
    const version = this.store.get('version');
    if (version !== undefined) {
      return this.mapStoreToPreferences();
    }

    const newPrefs = this.initialPreferences();
    await this.savePreferences(newPrefs);

    return newPrefs;
  }

  async savePreferences(prefs: IPreferences): Promise<void> {
    this.store.set('version', CUR_VERSION);
    this.store.set('openRecordHomeDirWhenRecordCompleted', prefs.openRecordHomeDirWhenRecordCompleted);
    this.store.set('recordHomeDir', prefs.recordHomeDir);
  }

  private initialPreferences(): IPreferences {
    return {
      openRecordHomeDirWhenRecordCompleted: true,
      recordHomeDir: app.getPath('videos'),
    };
  }

  private mapStoreToPreferences(): IPreferences {
    return {
      openRecordHomeDirWhenRecordCompleted: this.store.get('openRecordHomeDirWhenRecordCompleted') as boolean,
      recordHomeDir: this.store.get('recordHomeDir') as string,
    };
  }
}
