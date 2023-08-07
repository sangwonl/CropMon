/* eslint-disable import/order */

import 'reflect-metadata';
import { anyString, anything, instance, mock, verify, when } from 'ts-mockito';

import SimpleLicenseManager from '@adapters/license';
import { License } from '@domain/models/license';
import SafeCipher from '@adapters/crypto';
import { Preferences } from '@domain/models/preferences';
import { CaptureMode } from '@domain/models/common';
import { LicenseManager } from '@application/ports/license';
import { PreferencesStore } from '@application/ports/preferences';

const TEST_KEY =
  'B3BA2A2B37CEC3AD-7901A1A9-119DD0D3-F47EE96105D8A63D-66006A5406EAEFEB';

describe('LicenseManager', () => {
  const apiBaseUrl = 'http://localhost:8080';

  const licenseData: License = {
    key: TEST_KEY,
    email: 'gamz@gmail.com',
    validated: true,
    registeredAt: 1000,
    lastCheckedAt: 1000,
  };

  const prefs: Preferences = {
    initialLoaded: true,
    version: '0.9.5',
    runAtStartup: true,
    shortcut: 'Cmd+Shift+Enter',
    recordHome: '/capture',
    openRecordHomeWhenRecordCompleted: true,
    showCountdown: false,
    recordAudio: false,
    audioSources: [],
    outputFormat: 'mp4',
    captureMode: CaptureMode.AREA,
    colors: {
      selectingBackground: '#eee',
      selectingText: '#111',
      countdownBackground: '#eee',
      countdownText: '#111',
    },
    license: 'encryptedstring',
  };

  let mockedPrefsStore: PreferencesStore;
  let prefsStore: PreferencesStore;

  let mockedSafeCipher: SafeCipher;
  let safeCipher: SafeCipher;

  let licenseManager: LicenseManager;

  beforeEach(() => {
    mockedPrefsStore = mock<PreferencesStore>();
    prefsStore = instance(mockedPrefsStore);

    mockedSafeCipher = mock<SafeCipher>();
    safeCipher = instance(mockedSafeCipher);

    licenseManager = new SimpleLicenseManager(
      prefsStore,
      safeCipher,
      apiBaseUrl,
    );
  });

  it('should validate given license key through api', async () => {
    const license = await licenseManager.validateLicenseKey(
      licenseData.email,
      licenseData.key,
    );
    expect(license).not.toBeNull();
    expect(license?.key).toEqual(TEST_KEY);
  });

  it('should store license data to secure storage', async () => {
    when(mockedPrefsStore.loadPreferences()).thenResolve(prefs);
    when(mockedPrefsStore.savePreferences(anything())).thenResolve();
    when(mockedSafeCipher.encrypt(anything())).thenReturn(prefs.license);

    await expect(() => licenseManager.storeLicense(licenseData)).not.toThrow();
    verify(mockedSafeCipher.encrypt(licenseData)).once();
  });

  it('should get license data from store', async () => {
    when(mockedPrefsStore.loadPreferences()).thenResolve(prefs);
    when(mockedSafeCipher.decrypt(anyString())).thenReturn(licenseData);

    const license = await licenseManager.retrieveLicense();
    expect(license).not.toBeNull();
    expect(license?.key).toEqual(licenseData.key);
    verify(mockedPrefsStore.loadPreferences()).once();
    verify(mockedSafeCipher.decrypt(anyString())).once();
  });
});
