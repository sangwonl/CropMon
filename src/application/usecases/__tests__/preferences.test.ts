/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-expect-in-promise */

import { mock, instance, verify, when, anything, capture } from 'ts-mockito';

import { CaptureMode } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';

import PreferencesUseCase from '@application/usecases/preferences';
import HookManager from '@application/services/hook';
import { PreferencesStore } from '@application/ports/preferences';
import { UiDirector } from '@application/ports/director';

import { DEFAULT_SHORTCUT_CAPTURE } from '@utils/shortcut';

describe('PreferenceUseCase', () => {
  let mockedPreferencesStore: PreferencesStore;
  let mockPrefsStore: PreferencesStore;

  let mockedUiDirector: UiDirector;
  let mockUiDirector: UiDirector;

  let mockedHookManager: HookManager;
  let mockHookMgr: HookManager;

  let useCase: PreferencesUseCase;

  const defaultPrefs: Preferences = {
    initialLoaded: false,
    version: '0.0.1',
    runAtStartup: true,
    shortcut: 'Ctrl+Shift+S',
    recordHome: '/var/capture',
    openRecordHomeWhenRecordCompleted: true,
    showCountdown: false,
    recordMicrophone: false,
    outputFormat: 'mp4',
    captureMode: CaptureMode.AREA,
    colors: {
      selectingBackground: '#fefefe',
      selectingText: '#efefef',
      countdownBackground: '#fefefe',
      countdownText: '#efefef',
    },
  };

  beforeEach(() => {
    mockedPreferencesStore = mock<PreferencesStore>();
    mockedUiDirector = mock<UiDirector>();
    mockedHookManager = mock(HookManager);

    mockPrefsStore = instance(mockedPreferencesStore);
    mockUiDirector = instance(mockedUiDirector);
    mockHookMgr = instance(mockedHookManager);

    useCase = new PreferencesUseCase(
      mockHookMgr,
      mockUiDirector,
      mockPrefsStore
    );
  });

  describe('fetchUserPreferences', () => {
    it('should try to load preferences from persistent app data', async () => {
      const mockPrefs: Preferences = {
        ...defaultPrefs,
        version: '0.0.1',
        openRecordHomeWhenRecordCompleted: true,
        recordHome: '/temp/records',
        shortcut: DEFAULT_SHORTCUT_CAPTURE,
      };

      when(mockedPreferencesStore.loadPreferences()).thenReturn(
        Promise.resolve(mockPrefs)
      );

      const userPrefs = await useCase.fetchUserPreferences();
      expect(userPrefs.recordHome).toEqual(mockPrefs.recordHome);
      expect(userPrefs.openRecordHomeWhenRecordCompleted).toBeTruthy();
      verify(mockedPreferencesStore.loadPreferences()).once();
    });

    it('should throw error if there is some error to load preferences', async () => {
      when(mockedPreferencesStore.loadPreferences()).thenThrow(new Error());

      useCase.fetchUserPreferences().catch((e) => {
        expect(e).toBeInstanceOf(Error);
      });
      verify(mockedPreferencesStore.loadPreferences()).once();
    });
  });

  describe('updateUserPreferences', () => {
    it('should save user preferences to persistent app data', async () => {
      const mockPrefs: Preferences = {
        ...defaultPrefs,
        version: '0.0.1',
        openRecordHomeWhenRecordCompleted: true,
        recordHome: '/temp/records',
        shortcut: DEFAULT_SHORTCUT_CAPTURE,
      };

      await useCase.updateUserPreference(mockPrefs);

      const [argPrefs] = capture(mockedPreferencesStore.savePreferences).last();
      expect(argPrefs).toStrictEqual(mockPrefs);
      verify(mockedPreferencesStore.savePreferences(anything())).once();
    });
  });
});
