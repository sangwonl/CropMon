import 'reflect-metadata';

import SimpleLicenseManager from '@adapters/license';

const TEST_KEY =
  'B3BA2A2B37CEC3AD-7901A1A9-119DD0D3-F47EE96105D8A63D-66006A5406EAEFEB';

describe('LicenseManager', () => {
  const licenseManager: SimpleLicenseManager = new SimpleLicenseManager();

  it('should validate given license key through api', async () => {
    const license = await licenseManager.validateLicenseKey(TEST_KEY);
    expect(license).not.toBeNull();
    expect(license?.key).toEqual(TEST_KEY);
  });

  it('should store license data to secure storage', async () => {});
});
