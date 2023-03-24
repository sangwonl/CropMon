/* eslint-disable import/order */

import 'reflect-metadata';
import {
  anyOfClass,
  anyString,
  anything,
  instance,
  mock,
  verify,
  when,
} from 'ts-mockito';

import SimpleLicenseManager from '@adapters/license';
import { License } from '@domain/models/license';
import SecureStore from '@adapters/store';

const TEST_KEY =
  'B3BA2A2B37CEC3AD-7901A1A9-119DD0D3-F47EE96105D8A63D-66006A5406EAEFEB';

describe('LicenseManager', () => {
  const apiBaseUrl = 'http://localhost:8080';

  const licenseData: License = {
    key: TEST_KEY,
    email: 'gamz@gmail.com',
    validatedAt: 1000,
  };

  const mockedSecureStore = mock<SecureStore>();
  const secureStore = instance(mockedSecureStore);

  const licenseManager = new SimpleLicenseManager(secureStore, apiBaseUrl);

  it('should validate given license key through api', async () => {
    const license = await licenseManager.validateLicenseKey(TEST_KEY);
    expect(license).not.toBeNull();
    expect(license?.key).toEqual(TEST_KEY);
  });

  it('should store license data to secure storage', async () => {
    when(mockedSecureStore.set(anyString(), anything())).thenReturn(true);

    const result = licenseManager.storeLicense(licenseData);
    expect(result).toBeTruthy();
    verify(mockedSecureStore.set('license', licenseData)).once();
  });

  it('should get license data from store', async () => {
    when(mockedSecureStore.get(anyString())).thenReturn(licenseData);

    const license = licenseManager.retrieveLicense();
    expect(license).not.toBeNull();
    expect(license?.key).toEqual(licenseData.key);
  });
});
