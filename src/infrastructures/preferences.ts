/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';
import { app } from 'electron';
import Store from 'electron-store';

import { TYPES } from '@di/types';
import { IPreferences, OutputFormat, RecordQualityMode } from '@core/entities/preferences';
import { IPreferencesStore } from '@core/interfaces/preferences';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { getPlatform } from '@utils/process';
import { INITIAL_SHORTCUT } from '@utils/shortcut';

import { version as curVersion } from '../package.json';

@injectable()
export class PreferencesStore implements IPreferencesStore {
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
    this.store.set('version', prefs.version);
    this.store.set('runAtStartup', prefs.runAtStartup);
    this.store.set('shortcut', prefs.shortcut);
    this.store.set('openRecordHomeDirWhenRecordCompleted', prefs.openRecordHomeWhenRecordCompleted);
    this.store.set('recordHomeDir', prefs.recordHome);
    this.store.set('recordMicrophone', prefs.recordMicrophone);
    this.store.set('recordQualityMode', prefs.recordQualityMode);
    this.store.set('outputFormat', prefs.outputFormat);
  }

  private initialPreferences(): IPreferences {
    return {
      initialLoaded: true,
      version: curVersion,
      runAtStartup: true,
      shortcut: INITIAL_SHORTCUT,
      openRecordHomeWhenRecordCompleted: true,
      recordHome: app.getPath('videos'),
      recordMicrophone: false,
      recordQualityMode: 'normal',
      outputFormat: 'mp4',
    };
  }

  private mapStoreToPreferences(): IPreferences {
    return {
      initialLoaded: false,
      version: this.store.get('version') as string,
      runAtStartup: this.store.get('runAtStartup', true) as boolean,
      shortcut: this.store.get('shortcut', INITIAL_SHORTCUT) as string,
      openRecordHomeWhenRecordCompleted: this.store.get('openRecordHomeDirWhenRecordCompleted') as boolean,
      recordHome: this.store.get('recordHomeDir') as string,
      recordMicrophone: this.store.get('recordMicrophone', false) as boolean,
      recordQualityMode: this.store.get('recordQualityMode', 'normal') as RecordQualityMode,
      outputFormat: this.store.get('outputFormat', 'mp4') as OutputFormat,
    };
  }
}
