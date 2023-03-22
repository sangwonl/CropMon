import { injectable } from 'inversify';
import fetch from 'node-fetch';

import { License } from '@domain/models/license';

import { LicenseManager } from '@application/ports/license';

const API_BASE_URL = 'http://localhost:8080';
const API_TOKEN_HEADER = 'kropsaurus-api-token';

@injectable()
export default class SimpleLicenseManager implements LicenseManager {
  async validateLicenseKey(key: string): Promise<License | null> {
    const res = await fetch(`${API_BASE_URL}/validateLicenseKey`, {
      method: 'POST',
      body: JSON.stringify({ licenseKey: key }),
      headers: {
        'Content-Type': 'application/json',
        [API_TOKEN_HEADER]: 'any',
      },
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
      validatedAt: new Date(),
    };
  }

  storeLicense(license: License): boolean {
    return false;
  }

  retrieveLicense(): License | null {
    return null;
  }
}
