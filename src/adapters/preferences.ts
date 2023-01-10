import { app } from 'electron';
import Store from 'electron-store';
import { injectable } from 'inversify';

import { DEFAULT_SHORTCUT_CAPTURE } from '@utils/shortcut';

import { AudioSource, CaptureMode, OutputFormat } from '@domain/models/common';
import {
  Preferences,
  AppearancesColors,
  DEFAULT_APPEAR_COLORS,
} from '@domain/models/preferences';

import { PreferencesStore } from '@application/ports/preferences';

import { version as curVersion } from '../package.json';

const PREFS_VERSION = 'version';
const PREFS_GENERAL_RUNATSTARTUP = 'general.runAtStartup';
const PREFS_GENERAL_SHOWCOUNTDOWN = 'general.showCountdown';
const PREFS_GENERAL_SHORTCUT = 'general.shortcut';
const PREFS_GENERAL_RECORDHOME = 'general.recrodHomeDir';
const PREFS_GENERAL_REVEALRECORDEDFILE = 'general.revealRecordedFile';
const PREFS_RECORDING_MICROPHONE = 'recording.microphone'; /* deprecated */
const PREFS_RECORDING_CAPTUREMODE = 'recording.captureMode';
const PREFS_RECORDING_OUTPUTFORMAT = 'recording.outputFormat';
const PREFS_RECORDING_RECORDAUDIO = 'recording.recordAudio';
const PREFS_RECORDING_AUDIOSOURCES = 'recording.audioSources';
const PREFS_RECORDING_QUALITYMODE = 'recording.qualityMode';
const PREFS_APPEAR_COLOR_SELECT_BG = 'appearances.colors.selectingBackground';
const PREFS_APPEAR_COLOR_SELECT_TEXT = 'appearances.colors.selectingText';
const PREFS_APPEAR_COLOR_COUNTDOWN_BG =
  'appearances.colors.countdownBackground';
const PREFS_APPEAR_COLOR_COUNTDOWN_TEXT = 'appearances.colors.countdownText';

@injectable()
export default class ElectronPreferencesStore implements PreferencesStore {
  store!: Store;

  constructor() {
    this.store = new Store({
      name: 'config',
      fileExtension: 'json',
      accessPropertiesByDotNotation: false,
      migrations: {
        '0.6.2': (store) => {
          const curPrefs: Preferences = {
            initialLoaded: false,
            version: store.get('version') as string,
            runAtStartup: store.get('runAtStartup', true) as boolean,
            showCountdown: true, // newly added on 0.6.2
            shortcut: store.get('shortcut', DEFAULT_SHORTCUT_CAPTURE) as string,
            recordHome: store.get(
              'recordHomeDir',
              app.getPath('videos')
            ) as string,
            openRecordHomeWhenRecordCompleted: store.get(
              'openRecordHomeDirWhenRecordCompleted',
              true
            ) as boolean,
            captureMode: CaptureMode.AREA, // newly added on 0.7.0
            outputFormat: store.get('outputFormat', 'mp4') as OutputFormat,
            recordAudio: false,
            audioSources: [],
            colors: DEFAULT_APPEAR_COLORS,
          };

          store.set(PREFS_GENERAL_RUNATSTARTUP, curPrefs.runAtStartup);
          store.set(PREFS_GENERAL_SHOWCOUNTDOWN, curPrefs.showCountdown);
          store.set(PREFS_GENERAL_SHORTCUT, curPrefs.shortcut);
          store.set(PREFS_GENERAL_RECORDHOME, curPrefs.recordHome);
          store.set(
            PREFS_GENERAL_REVEALRECORDEDFILE,
            curPrefs.openRecordHomeWhenRecordCompleted
          );
          store.set(PREFS_RECORDING_OUTPUTFORMAT, curPrefs.outputFormat);

          store.delete('runAtStartup');
          store.delete('shortcut');
          store.delete('recordHomeDir');
          store.delete('openRecordHomeDirWhenRecordCompleted');
          store.delete('recordMicrophone');
          store.delete('outputFormat');
        },
        '0.6.5': (store) => {
          store.set(
            PREFS_APPEAR_COLOR_SELECT_BG,
            DEFAULT_APPEAR_COLORS.selectingBackground
          );
          store.set(
            PREFS_APPEAR_COLOR_SELECT_TEXT,
            DEFAULT_APPEAR_COLORS.selectingText
          );
          store.set(
            PREFS_APPEAR_COLOR_COUNTDOWN_BG,
            DEFAULT_APPEAR_COLORS.countdownBackground
          );
          store.set(
            PREFS_APPEAR_COLOR_COUNTDOWN_TEXT,
            DEFAULT_APPEAR_COLORS.countdownText
          );
        },
        '0.7.0': (store) => {
          store.set(PREFS_RECORDING_CAPTUREMODE, CaptureMode.AREA);
        },
        '0.8.3': (store) => {
          store.delete(PREFS_RECORDING_QUALITYMODE);
        },
        '0.9.3': (store) => {
          store.set(PREFS_RECORDING_RECORDAUDIO, false);
          store.set(PREFS_RECORDING_AUDIOSOURCES, []);
          store.delete(PREFS_RECORDING_MICROPHONE);
        },
      },
    });
  }

  async loadPreferences(): Promise<Preferences> {
    const version = this.store.get('version');
    if (version !== undefined) {
      return this.mapStoreToPreferences();
    }

    const newPrefs = this.initialPreferences();
    await this.savePreferences(newPrefs);

    return newPrefs;
  }

  async savePreferences(prefs: Preferences): Promise<void> {
    this.store.set(PREFS_VERSION, prefs.version);
    this.store.set(PREFS_GENERAL_RUNATSTARTUP, prefs.runAtStartup);
    this.store.set(PREFS_GENERAL_SHORTCUT, prefs.shortcut);
    this.store.set(PREFS_GENERAL_RECORDHOME, prefs.recordHome);
    this.store.set(
      PREFS_GENERAL_REVEALRECORDEDFILE,
      prefs.openRecordHomeWhenRecordCompleted
    );
    this.store.set(PREFS_GENERAL_SHOWCOUNTDOWN, prefs.showCountdown);
    this.store.set(PREFS_RECORDING_CAPTUREMODE, prefs.captureMode);
    this.store.set(PREFS_RECORDING_OUTPUTFORMAT, prefs.outputFormat);
    this.store.set(PREFS_RECORDING_RECORDAUDIO, prefs.recordAudio);
    this.store.set(PREFS_RECORDING_AUDIOSOURCES, prefs.audioSources);
    this.store.set(
      PREFS_APPEAR_COLOR_SELECT_BG,
      prefs.colors.selectingBackground
    );
    this.store.set(PREFS_APPEAR_COLOR_SELECT_TEXT, prefs.colors.selectingText);
    this.store.set(
      PREFS_APPEAR_COLOR_COUNTDOWN_BG,
      prefs.colors.countdownBackground
    );
    this.store.set(
      PREFS_APPEAR_COLOR_COUNTDOWN_TEXT,
      prefs.colors.countdownText
    );
  }

  private initialPreferences(): Preferences {
    return {
      initialLoaded: true,
      version: curVersion,
      runAtStartup: true,
      shortcut: DEFAULT_SHORTCUT_CAPTURE,
      recordHome: app.getPath('videos'),
      openRecordHomeWhenRecordCompleted: true,
      showCountdown: true,
      captureMode: CaptureMode.AREA,
      outputFormat: 'mp4',
      recordAudio: false,
      audioSources: [],
      colors: DEFAULT_APPEAR_COLORS,
    };
  }

  private mapStoreToPreferences(): Preferences {
    const colors: AppearancesColors = {
      selectingBackground: this.store.get(
        PREFS_APPEAR_COLOR_SELECT_BG,
        DEFAULT_APPEAR_COLORS.selectingBackground
      ) as string,
      selectingText: this.store.get(
        PREFS_APPEAR_COLOR_SELECT_TEXT,
        DEFAULT_APPEAR_COLORS.selectingText
      ) as string,
      countdownBackground: this.store.get(
        PREFS_APPEAR_COLOR_COUNTDOWN_BG,
        DEFAULT_APPEAR_COLORS.countdownBackground
      ) as string,
      countdownText: this.store.get(
        PREFS_APPEAR_COLOR_COUNTDOWN_TEXT,
        DEFAULT_APPEAR_COLORS.countdownText
      ) as string,
    };
    return {
      initialLoaded: false,
      version: this.store.get(PREFS_VERSION) as string,
      runAtStartup: this.store.get(PREFS_GENERAL_RUNATSTARTUP, true) as boolean,
      shortcut: this.store.get(
        PREFS_GENERAL_SHORTCUT,
        DEFAULT_SHORTCUT_CAPTURE
      ) as string,
      recordHome: this.store.get(
        PREFS_GENERAL_RECORDHOME,
        app.getPath('videos')
      ) as string,
      openRecordHomeWhenRecordCompleted: this.store.get(
        PREFS_GENERAL_REVEALRECORDEDFILE,
        true
      ) as boolean,
      showCountdown: this.store.get(
        PREFS_GENERAL_SHOWCOUNTDOWN,
        true
      ) as boolean,
      captureMode: this.store.get(
        PREFS_RECORDING_CAPTUREMODE,
        CaptureMode.AREA
      ) as CaptureMode,
      outputFormat: this.store.get(
        PREFS_RECORDING_OUTPUTFORMAT,
        'mp4'
      ) as OutputFormat,
      recordAudio: this.store.get(
        PREFS_RECORDING_RECORDAUDIO,
        false
      ) as boolean,
      audioSources: this.store.get(
        PREFS_RECORDING_AUDIOSOURCES,
        []
      ) as AudioSource[],
      colors,
    };
  }
}
