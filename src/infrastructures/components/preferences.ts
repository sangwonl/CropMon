/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';
import { app } from 'electron';
import Store from 'electron-store';

import { TYPES } from '@di/types';
import { IPreferences } from '@core/entities/preferences';
import { IPreferencesStore } from '@core/components/preferences';
import { IAnalyticsTracker } from '@core/components/tracker';
import { getPlatform } from '@utils/process';

import { version as curVersion } from '../../package.json';

@injectable()
export class PreferencesStoreImpl implements IPreferencesStore {
  store!: Store;

  constructor(
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker
  ) {
    this.store = new Store({
      name: 'config',
      fileExtension: 'json',
      accessPropertiesByDotNotation: false,
    });
  }

  async loadPreferences(): Promise<IPreferences> {
    const version = this.store.get('version');
    if (version !== undefined) {
      return this.mapStoreToPreferences();
    }

    const newPrefs = this.initialPreferences();
    await this.savePreferences(newPrefs);
    this.tracker.eventL('app-lifecycle', 'initial-launch', getPlatform());

    return newPrefs;
  }

  async savePreferences(prefs: IPreferences): Promise<void> {
    this.store.set('version', curVersion);
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
