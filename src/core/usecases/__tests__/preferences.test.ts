/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-expect-in-promise */

import 'reflect-metadata';

import { mock, instance, verify, when, anything, capture } from 'ts-mockito';

import { IPreferences } from '@core/entities/preferences';
import { IPreferencesStore } from '@core/interfaces/preferences';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { IHookManager } from '@core/interfaces/hook';
import { DEFAULT_SHORTCUT_CAPTURE } from '@utils/shortcut';
import { IUiDirector } from '@core/interfaces/director';

describe('PreferenceUseCase', () => {
  let mockedPreferencesStore: IPreferencesStore;
  let mockPrefsStore: IPreferencesStore;

  let mockedUiDirector: IUiDirector;
  let mockUiDirector: IUiDirector;

  let mockedHookManager: IHookManager;
  let mockHookMgr: IHookManager;

  let useCase: PreferencesUseCase;

  beforeEach(() => {
    mockedPreferencesStore = mock<IPreferencesStore>();
    mockedUiDirector = mock<IUiDirector>();
    mockedHookManager = mock<IHookManager>();

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
