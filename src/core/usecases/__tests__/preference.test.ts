/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable no-return-await */
import 'reflect-metadata';

import { mock, instance, verify, when, anything, capture } from 'ts-mockito';

import { Preference } from '@core/entities';
import { GlobalRegistry, PreferenceStore } from '@core/components';
import { PreferenceUseCase } from '@core/usecases/preference';

describe('PreferenceUseCase', () => {
  let mockedGlobalRegistry: GlobalRegistry;
  let mockRegistry: GlobalRegistry;

  let mockedPreferenceStore: PreferenceStore;
  let mockPrefStore: PreferenceStore;

  let useCase: PreferenceUseCase;

  beforeEach(() => {
    mockedGlobalRegistry = mock(GlobalRegistry);
    mockedPreferenceStore = mock<PreferenceStore>();

    mockRegistry = instance(mockedGlobalRegistry);
    mockPrefStore = instance(mockedPreferenceStore);

    useCase = new PreferenceUseCase(mockRegistry, mockPrefStore);
  });

  describe('getUserPreference', () => {
    it('should return preference if it exists in registry', async () => {
      const mockPref = new Preference();
      mockPref.openRecordHomeDirWhenRecordCompleted = true;
      mockPref.recordHomeDir = '/temp/records';

      when(mockedGlobalRegistry.getUserPreference()).thenReturn(mockPref);

      const userPref = await useCase.getUserPreference();
      expect(userPref.recordHomeDir).toEqual(mockPref.recordHomeDir);
      expect(userPref.openRecordHomeDirWhenRecordCompleted).toBeTruthy();
      verify(mockedGlobalRegistry.getUserPreference()).once();
      verify(mockedPreferenceStore.loadPreference()).never();
    });

    it('should try to load preference from persistent app data', async () => {
      const mockPref = new Preference();
      mockPref.openRecordHomeDirWhenRecordCompleted = true;
      mockPref.recordHomeDir = '/temp/records';

      when(mockedGlobalRegistry.getUserPreference()).thenReturn(undefined);
      when(mockedPreferenceStore.loadPreference()).thenReturn(
        Promise.resolve(mockPref)
      );

      const userPref = await useCase.getUserPreference();
      expect(userPref.recordHomeDir).toEqual(mockPref.recordHomeDir);
      expect(userPref.openRecordHomeDirWhenRecordCompleted).toBeTruthy();
      verify(mockedGlobalRegistry.getUserPreference()).once();
      verify(mockedPreferenceStore.loadPreference()).once();
      verify(mockedGlobalRegistry.setUserPreference(anything())).once();
    });

    it('should throw error if there is some error to load preference', async () => {
      when(mockedGlobalRegistry.getUserPreference()).thenReturn(undefined);
      when(mockedPreferenceStore.loadPreference()).thenThrow(new Error());

      useCase.getUserPreference().catch((e) => {
        expect(e).toBeInstanceOf(Error);
      });
      verify(mockedGlobalRegistry.getUserPreference()).once();
      verify(mockedPreferenceStore.loadPreference()).once();
    });
  });

  describe('updateUserPreference', () => {
    it('should save user preference to persistent app data', async () => {
      const mockPref = new Preference();
      mockPref.openRecordHomeDirWhenRecordCompleted = true;
      mockPref.recordHomeDir = '/temp/records';

      await useCase.updateUserPreference(mockPref);

      const [argPref] = capture(mockedPreferenceStore.savePreference).last();
      expect(argPref).toStrictEqual(mockPref);
      verify(mockedPreferenceStore.savePreference(anything())).once();
      verify(mockedGlobalRegistry.setUserPreference(anything())).once();
    });
  });
});
