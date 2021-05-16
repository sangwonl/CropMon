/* eslint-disable jest/valid-expect-in-promise */

import 'reflect-metadata';

import { mock, instance, verify, when, anything, capture } from 'ts-mockito';

import { IPreferences } from '@core/entities/preferences';
import { GlobalRegistry } from '@core/components/registry';
import { IPreferencesStore } from '@core/components/preferences';
import { IAnalyticsTracker } from '@core/components/tracker';
import { PreferencesUseCase } from '@core/usecases/preferences';

describe('PreferenceUseCase', () => {
  let mockedGlobalRegistry: GlobalRegistry;
  let mockRegistry: GlobalRegistry;

  let mockedPreferencesStore: IPreferencesStore;
  let mockPrefsStore: IPreferencesStore;

  let mockedAnalyticsTracker: IAnalyticsTracker;
  let mockTracker: IAnalyticsTracker;

  let useCase: PreferencesUseCase;

  beforeEach(() => {
    mockedGlobalRegistry = mock(GlobalRegistry);
    mockedPreferencesStore = mock<IPreferencesStore>();
    mockedAnalyticsTracker = mock<IAnalyticsTracker>();

    mockRegistry = instance(mockedGlobalRegistry);
    mockPrefsStore = instance(mockedPreferencesStore);
    mockTracker = instance(mockedAnalyticsTracker);

    useCase = new PreferencesUseCase(mockRegistry, mockPrefsStore, mockTracker);
  });

  describe('getUserPreferences', () => {
    it('should return preferences if it exists in registry', async () => {
      const mockPrefs: IPreferences = {
        openRecordHomeDirWhenRecordCompleted: true,
        recordHomeDir: '/temp/records',
      };

      when(mockedGlobalRegistry.getUserPreferences()).thenReturn(mockPrefs);

      const userPrefs = await useCase.getUserPreferences();
      expect(userPrefs.recordHomeDir).toEqual(mockPrefs.recordHomeDir);
      expect(userPrefs.openRecordHomeDirWhenRecordCompleted).toBeTruthy();
      verify(mockedGlobalRegistry.getUserPreferences()).once();
      verify(mockedPreferencesStore.loadPreferences()).never();
    });

    it('should try to load preferences from persistent app data', async () => {
      const mockPrefs: IPreferences = {
        openRecordHomeDirWhenRecordCompleted: true,
        recordHomeDir: '/temp/records',
      };

      when(mockedGlobalRegistry.getUserPreferences()).thenReturn(undefined);
      when(mockedPreferencesStore.loadPreferences()).thenReturn(
        Promise.resolve(mockPrefs)
      );

      const userPrefs = await useCase.getUserPreferences();
      expect(userPrefs.recordHomeDir).toEqual(mockPrefs.recordHomeDir);
      expect(userPrefs.openRecordHomeDirWhenRecordCompleted).toBeTruthy();
      verify(mockedGlobalRegistry.getUserPreferences()).once();
      verify(mockedPreferencesStore.loadPreferences()).once();
      verify(mockedGlobalRegistry.setUserPreferences(anything())).once();
    });

    it('should throw error if there is some error to load preferences', async () => {
      when(mockedGlobalRegistry.getUserPreferences()).thenReturn(undefined);
      when(mockedPreferencesStore.loadPreferences()).thenThrow(new Error());

      useCase.getUserPreferences().catch((e) => {
        expect(e).toBeInstanceOf(Error);
      });
      verify(mockedGlobalRegistry.getUserPreferences()).once();
      verify(mockedPreferencesStore.loadPreferences()).once();
    });
  });

  describe('updateUserPreferences', () => {
    it('should save user preferences to persistent app data', async () => {
      const mockPrefs: IPreferences = {
        openRecordHomeDirWhenRecordCompleted: true,
        recordHomeDir: '/temp/records',
      };

      await useCase.updateUserPreference(mockPrefs);

      const [argPrefs] = capture(mockedPreferencesStore.savePreferences).last();
      expect(argPrefs).toStrictEqual(mockPrefs);
      verify(mockedPreferencesStore.savePreferences(anything())).once();
      verify(mockedGlobalRegistry.setUserPreferences(anything())).once();
    });
  });
});
