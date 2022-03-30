/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-expect-in-promise */

import { mock, instance, verify, when, anything, capture } from 'ts-mockito';

import { CaptureMode } from '@core/entities/common';
import { IPreferences } from '@core/entities/preferences';
import { IPreferencesStore } from '@core/services/preferences';
import { IUiDirector } from '@core/services/director';
import HookManager from '@core/services/hook';
import PreferencesUseCase from '@core/usecases/preferences';
import { DEFAULT_SHORTCUT_CAPTURE } from '@utils/shortcut';

describe('PreferenceUseCase', () => {
  let mockedPreferencesStore: IPreferencesStore;
  let mockPrefsStore: IPreferencesStore;

  let mockedUiDirector: IUiDirector;
  let mockUiDirector: IUiDirector;

  let mockedHookManager: HookManager;
  let mockHookMgr: HookManager;

  let useCase: PreferencesUseCase;

  const defaultPrefs: IPreferences = {
    initialLoaded: false,
    version: '0.0.1',
    runAtStartup: true,
    shortcut: 'Ctrl+Shift+S',
    recordHome: '/var/capture',
    openRecordHomeWhenRecordCompleted: true,
    showCountdown: false,
    recordMicrophone: false,
    recordQualityMode: 'normal',
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
    mockedPreferencesStore = mock<IPreferencesStore>();
    mockedUiDirector = mock<IUiDirector>();
    mockedHookManager = mock(HookManager);

    mockPrefsStore = instance(mockedPreferencesStore);
    mockUiDirector = instance(mockedUiDirector);
    mockHookMgr = instance(mockedHookManager);

    useCase = new PreferencesUseCase(
      mockPrefsStore,
      mockUiDirector,
      mockHookMgr
    );
  });

  describe('fetchUserPreferences', () => {
    it('should try to load preferences from persistent app data', async () => {
      const mockPrefs: IPreferences = {
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
      const mockPrefs: IPreferences = {
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
