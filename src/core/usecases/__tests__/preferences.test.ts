/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-expect-in-promise */

import 'reflect-metadata';

import { mock, instance, verify, when, anything, capture } from 'ts-mockito';

import { IPreferences } from '@core/entities/preferences';
import { StateManager } from '@core/interfaces/state';
import { IPreferencesStore } from '@core/interfaces/preferences';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { IHookManager } from '@core/interfaces/hook';

describe('PreferenceUseCase', () => {
  let mockedGlobalRegistry: StateManager;
  let mockRegistry: StateManager;

  let mockedPreferencesStore: IPreferencesStore;
  let mockPrefsStore: IPreferencesStore;

  let mockedAnalyticsTracker: IAnalyticsTracker;
  let mockTracker: IAnalyticsTracker;

  let mockedHookManager: IHookManager;
  let mockHookMgr: IHookManager;

  let useCase: PreferencesUseCase;

  beforeEach(() => {
    mockedGlobalRegistry = mock(StateManager);
    mockedPreferencesStore = mock<IPreferencesStore>();
    mockedAnalyticsTracker = mock<IAnalyticsTracker>();
    mockedHookManager = mock<IHookManager>();

    mockRegistry = instance(mockedGlobalRegistry);
    mockPrefsStore = instance(mockedPreferencesStore);
    mockTracker = instance(mockedAnalyticsTracker);
    mockHookMgr = instance(mockedHookManager);

    useCase = new PreferencesUseCase(
      mockRegistry,
      mockPrefsStore,
      mockTracker,
      mockHookMgr
    );
  });

  describe('getUserPreferences', () => {
    it('should return preferences if it exists in registry', async () => {
      const mockPrefs: IPreferences = {
        version: '0.0.1',
        openRecordHomeDirWhenRecordCompleted: true,
        recordHomeDir: '/temp/records',
        shortcut: 'Super+Shift+E',
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
        version: '0.0.1',
        openRecordHomeDirWhenRecordCompleted: true,
        recordHomeDir: '/temp/records',
        shortcut: 'Super+Shift+E',
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
        version: '0.0.1',
        openRecordHomeDirWhenRecordCompleted: true,
        recordHomeDir: '/temp/records',
        shortcut: 'Super+Shift+E',
      };

      await useCase.updateUserPreference(mockPrefs);

      const [argPrefs] = capture(mockedPreferencesStore.savePreferences).last();
      expect(argPrefs).toStrictEqual(mockPrefs);
      verify(mockedPreferencesStore.savePreferences(anything())).once();
      verify(mockedGlobalRegistry.setUserPreferences(anything())).once();
    });
  });
});
