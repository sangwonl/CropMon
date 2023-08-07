import 'reflect-metadata';
import {
  mock,
  instance,
  verify,
  when,
  anything,
  capture,
  anyString,
} from 'ts-mockito';

import { DEFAULT_SHORTCUT_CAPTURE } from '@utils/shortcut';

import { CaptureMode } from '@domain/models/common';
import type { Preferences } from '@domain/models/preferences';
import type { PreferencesRepository } from '@domain/repositories/preferences';

import type { PreferencesStore } from '@application/ports/preferences';
import HookManager from '@application/services/hook';

import PrefsRepositoryImpl from '@adapters/repositories/preferences';

describe('PreferencesRepository', () => {
  let mockedPrefsStore: PreferencesStore;
  let prefsStore: PreferencesStore;

  let mockedHookMgr: HookManager;
  let hookMgr: HookManager;

  let prefsRepo: PreferencesRepository;

  const defaultPrefs: Preferences = {
    initialLoaded: false,
    version: '0.0.1',
    runAtStartup: true,
    shortcut: 'Ctrl+Shift+S',
    recordHome: '/var/capture',
    openRecordHomeWhenRecordCompleted: true,
    showCountdown: false,
    recordAudio: false,
    audioSources: [],
    outputFormat: 'mp4',
    captureMode: CaptureMode.AREA,
    colors: {
      selectingBackground: '#fefefe',
      selectingText: '#efefef',
      countdownBackground: '#fefefe',
      countdownText: '#efefef',
    },
    license: null,
  };

  beforeEach(() => {
    mockedPrefsStore = mock<PreferencesStore>();
    prefsStore = instance(mockedPrefsStore);

    mockedHookMgr = mock(HookManager);
    hookMgr = instance(mockedHookMgr);

    prefsRepo = new PrefsRepositoryImpl(hookMgr, prefsStore);
  });

  describe('fetchPreferences', () => {
    it('should try to load preferences from persistent app data', async () => {
      const mockPrefs: Preferences = {
        ...defaultPrefs,
        version: '0.0.1',
        openRecordHomeWhenRecordCompleted: true,
        recordHome: '/temp/records',
        shortcut: DEFAULT_SHORTCUT_CAPTURE,
      };

      when(mockedPrefsStore.loadPreferences()).thenResolve(mockPrefs);

      const prefs = await prefsRepo.fetchPreferences();
      expect(prefs.recordHome).toEqual(mockPrefs.recordHome);
      expect(prefs.openRecordHomeWhenRecordCompleted).toBeTruthy();
      verify(mockedPrefsStore.loadPreferences()).once();
      verify(mockedHookMgr.emit('onPrefsLoaded', anything())).once();
    });

    it('should throw error if there is some error to load preferences', async () => {
      when(mockedPrefsStore.loadPreferences()).thenReject();

      await expect(() => prefsRepo.fetchPreferences()).rejects.toThrow();
      verify(mockedPrefsStore.loadPreferences()).once();
      verify(mockedHookMgr.emit(anyString(), anything())).never();
    });
  });

  describe('updatePreferences', () => {
    it('should save user preferences to persistent app data', async () => {
      const prefs: Preferences = {
        ...defaultPrefs,
        version: '0.0.1',
        openRecordHomeWhenRecordCompleted: true,
        recordHome: '/temp/records',
        shortcut: DEFAULT_SHORTCUT_CAPTURE,
      };

      await prefsRepo.updatePreference(prefs);

      const [argPrefs] = capture(mockedPrefsStore.savePreferences).last();
      expect(argPrefs).toStrictEqual(prefs);
      verify(mockedPrefsStore.savePreferences(anything())).once();
    });
  });
});
