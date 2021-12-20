/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { app } from 'electron';
import Store from 'electron-store';

import { CaptureMode, OutputFormat, RecordQualityMode } from '@core/entities/common';
import { IPreferences, IAppearancesColors, DEFAULT_APPEAR_COLORS } from '@core/entities/preferences';
import { IPreferencesStore } from '@core/interfaces/preferences';
import { DEFAULT_SHORTCUT_CAPTURE } from '@utils/shortcut';

import { version as curVersion } from '../package.json';

const PREFS_VERSION = 'version';
const PREFS_GENERAL_RUNATSTARTUP = 'general.runAtStartup';
const PREFS_GENERAL_SHOWCOUNTDOWN = 'general.showCountdown';
const PREFS_GENERAL_SHORTCUT = 'general.shortcut';
const PREFS_GENERAL_RECORDHOME = 'general.recrodHomeDir';
const PREFS_GENERAL_REVEALRECORDEDFILE = 'general.revealRecordedFile';
const PREFS_RECORDING_MICROPHONE = 'recording.microphone';
const PREFS_RECORDING_QUALITYMODE = 'recording.qualityMode';
const PREFS_RECORDING_OUTPUTFORMAT = 'recording.outputFormat';
const PREFS_RECORDING_CAPTUREMODE = 'recording.captureMode';
const PREFS_APPEAR_COLOR_SELECT_BG = 'appearances.colors.selectingBackground';
const PREFS_APPEAR_COLOR_SELECT_TEXT = 'appearances.colors.selectingText';
const PREFS_APPEAR_COLOR_COUNTDOWN_BG = 'appearances.colors.countdownBackground';
const PREFS_APPEAR_COLOR_COUNTDOWN_TEXT = 'appearances.colors.countdownText';

@injectable()
export class PreferencesStore implements IPreferencesStore {
  store!: Store;

  constructor() {
    this.store = new Store({
      name: 'config',
      fileExtension: 'json',
      accessPropertiesByDotNotation: false,
      migrations: {
        '0.6.2': (store) => {
          const curPrefs: IPreferences = {
            initialLoaded: false,
            version: store.get('version') as string,
            runAtStartup: store.get('runAtStartup', true) as boolean,
            showCountdown: true, // newly added on 0.6.2
            shortcut: store.get('shortcut', DEFAULT_SHORTCUT_CAPTURE) as string,
            recordHome: store.get('recordHomeDir', app.getPath('videos')) as string,
            openRecordHomeWhenRecordCompleted: store.get('openRecordHomeDirWhenRecordCompleted', true) as boolean,
            recordMicrophone: store.get('recordMicrophone', false) as boolean,
            recordQualityMode: store.get('recordQualityMode', 'normal') as RecordQualityMode,
            outputFormat: store.get('outputFormat', 'mp4') as OutputFormat,
            captureMode: CaptureMode.AREA, // newly added on 0.7.0
            colors: DEFAULT_APPEAR_COLORS,
          }

          store.set(PREFS_GENERAL_RUNATSTARTUP, curPrefs.runAtStartup);
          store.set(PREFS_GENERAL_SHOWCOUNTDOWN, curPrefs.showCountdown);
          store.set(PREFS_GENERAL_SHORTCUT, curPrefs.shortcut);
          store.set(PREFS_GENERAL_RECORDHOME, curPrefs.recordHome);
          store.set(PREFS_GENERAL_REVEALRECORDEDFILE, curPrefs.openRecordHomeWhenRecordCompleted);
          store.set(PREFS_RECORDING_MICROPHONE, curPrefs.recordMicrophone);
          store.set(PREFS_RECORDING_QUALITYMODE, curPrefs.recordQualityMode);
          store.set(PREFS_RECORDING_OUTPUTFORMAT, curPrefs.outputFormat);

          store.delete('runAtStartup');
          store.delete('shortcut');
          store.delete('recordHomeDir');
          store.delete('openRecordHomeDirWhenRecordCompleted');
          store.delete('recordMicrophone');
          store.delete('recordQualityMode');
          store.delete('outputFormat');
        },
        '0.6.5': (store) => {
          store.set(PREFS_APPEAR_COLOR_SELECT_BG, DEFAULT_APPEAR_COLORS.selectingBackground);
          store.set(PREFS_APPEAR_COLOR_SELECT_TEXT, DEFAULT_APPEAR_COLORS.selectingText);
          store.set(PREFS_APPEAR_COLOR_COUNTDOWN_BG, DEFAULT_APPEAR_COLORS.countdownBackground);
          store.set(PREFS_APPEAR_COLOR_COUNTDOWN_TEXT, DEFAULT_APPEAR_COLORS.countdownText);
        },
        '0.7.0': (store) => {
          store.set(PREFS_RECORDING_CAPTUREMODE, CaptureMode.AREA);
        }
      }
    });
  }

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
    this.store.set(PREFS_VERSION, prefs.version);
    this.store.set(PREFS_GENERAL_RUNATSTARTUP, prefs.runAtStartup);
    this.store.set(PREFS_GENERAL_SHORTCUT, prefs.shortcut);
    this.store.set(PREFS_GENERAL_RECORDHOME, prefs.recordHome);
    this.store.set(PREFS_GENERAL_REVEALRECORDEDFILE, prefs.openRecordHomeWhenRecordCompleted);
    this.store.set(PREFS_GENERAL_SHOWCOUNTDOWN, prefs.showCountdown);
    this.store.set(PREFS_RECORDING_MICROPHONE, prefs.recordMicrophone);
    this.store.set(PREFS_RECORDING_QUALITYMODE, prefs.recordQualityMode);
    this.store.set(PREFS_RECORDING_OUTPUTFORMAT, prefs.outputFormat);
    this.store.set(PREFS_RECORDING_CAPTUREMODE, prefs.captureMode);
    this.store.set(PREFS_APPEAR_COLOR_SELECT_BG, prefs.colors.selectingBackground);
    this.store.set(PREFS_APPEAR_COLOR_SELECT_TEXT, prefs.colors.selectingText);
    this.store.set(PREFS_APPEAR_COLOR_COUNTDOWN_BG, prefs.colors.countdownBackground);
    this.store.set(PREFS_APPEAR_COLOR_COUNTDOWN_TEXT, prefs.colors.countdownText);
  }

  private initialPreferences(): IPreferences {
    return {
      initialLoaded: true,
      version: curVersion,
      runAtStartup: true,
      shortcut: DEFAULT_SHORTCUT_CAPTURE,
      recordHome: app.getPath('videos'),
      openRecordHomeWhenRecordCompleted: true,
      showCountdown: true,
      recordMicrophone: false,
      recordQualityMode: 'normal',
      outputFormat: 'mp4',
      captureMode: CaptureMode.AREA,
      colors: DEFAULT_APPEAR_COLORS,
    };
  }

  private mapStoreToPreferences(): IPreferences {
    const colors: IAppearancesColors = {
      selectingBackground: this.store.get(PREFS_APPEAR_COLOR_SELECT_BG, DEFAULT_APPEAR_COLORS.selectingBackground) as string,
      selectingText: this.store.get(PREFS_APPEAR_COLOR_SELECT_TEXT, DEFAULT_APPEAR_COLORS.selectingText) as string,
      countdownBackground: this.store.get(PREFS_APPEAR_COLOR_COUNTDOWN_BG, DEFAULT_APPEAR_COLORS.countdownBackground) as string,
      countdownText: this.store.get(PREFS_APPEAR_COLOR_COUNTDOWN_TEXT, DEFAULT_APPEAR_COLORS.countdownText) as string,
    };
    return {
      initialLoaded: false,
      version: this.store.get(PREFS_VERSION) as string,
      runAtStartup: this.store.get(PREFS_GENERAL_RUNATSTARTUP, true) as boolean,
      shortcut: this.store.get(PREFS_GENERAL_SHORTCUT, DEFAULT_SHORTCUT_CAPTURE) as string,
      recordHome: this.store.get(PREFS_GENERAL_RECORDHOME, app.getPath('videos')) as string,
      openRecordHomeWhenRecordCompleted: this.store.get(PREFS_GENERAL_REVEALRECORDEDFILE, true) as boolean,
      showCountdown: this.store.get(PREFS_GENERAL_SHOWCOUNTDOWN, true) as boolean,
      recordMicrophone: this.store.get(PREFS_RECORDING_MICROPHONE, false) as boolean,
      recordQualityMode: this.store.get(PREFS_RECORDING_QUALITYMODE, 'normal') as RecordQualityMode,
      outputFormat: this.store.get(PREFS_RECORDING_OUTPUTFORMAT, 'mp4') as OutputFormat,
      captureMode: this.store.get(PREFS_RECORDING_CAPTUREMODE, CaptureMode.AREA) as CaptureMode,
      colors,
    };
  }
}
