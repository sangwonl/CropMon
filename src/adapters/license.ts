import { injectable, optional } from 'inversify';
import fetch from 'node-fetch';

import { isProduction } from '@utils/process';

import { License } from '@domain/models/license';

import { LicenseManager } from '@application/ports/license';

import SecureStore from '@adapters/store';

const API_BASE_URL_DEV = 'https://dev-kropsaurus-api.pineple.com';
const API_BASE_URL_PROD = 'https://kropsaurus-api.pineple.com';

@injectable()
export default class SimpleLicenseManager implements LicenseManager {
  constructor(
    private secureStore: SecureStore,
    @optional() private apiBaseUrl: string
  ) {
    if (!apiBaseUrl) {
      this.apiBaseUrl = isProduction() ? API_BASE_URL_PROD : API_BASE_URL_DEV;
    }
  }

  async validateLicenseKey(key: string): Promise<License | null> {
    const res = await fetch(`${this.apiBaseUrl}/validateLicenseKey`, {
      method: 'POST',
      body: JSON.stringify({ licenseKey: key }),
      headers: { 'Content-Type': 'application/json' },
    });

    const { status, data } = await res.json();
    if (status !== 'success') {
      return null;
    }

    const { licenseKey, email } = data;
    if (key !== licenseKey) {
      return null;
    }

    return {
      key,
      email,
      validated: true,
      lastCheckedAt: new Date().getTime(),
    };
  }

  storeLicense(license: License): boolean {
    return this.secureStore.set('license', license);
  }

  retrieveLicense(): License | null {
    return this.secureStore.get('license');
  }
}
