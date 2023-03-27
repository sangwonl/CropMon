import { inject, injectable, optional } from 'inversify';
import fetch from 'node-fetch';

import { isProduction } from '@utils/process';

import TYPES from '@di/types';

import { License } from '@domain/models/license';

import { LicenseManager } from '@application/ports/license';
import { PreferencesStore } from '@application/ports/preferences';

import SafeCipher from '@adapters/crypto';

const API_BASE_URL_DEV = 'https://dev-kropsaurus-api.pineple.com';
const API_BASE_URL_PROD = 'https://kropsaurus-api.pineple.com';

@injectable()
export default class SimpleLicenseManager implements LicenseManager {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesStore) private prefsStore: PreferencesStore,
    private cipher: SafeCipher,
    @optional() private apiBaseUrl: string
  ) {
    if (!apiBaseUrl) {
      this.apiBaseUrl = isProduction() ? API_BASE_URL_PROD : API_BASE_URL_DEV;
    }
  }

  async validateLicenseKey(
    email: string,
    licenseKey: string
  ): Promise<License | null> {
    const res = await fetch(`${this.apiBaseUrl}/validateLicenseKey`, {
      method: 'POST',
      body: JSON.stringify({ email, licenseKey }),
      headers: { 'Content-Type': 'application/json' },
    });

    const { status, data } = await res.json();
    if (status !== 'success') {
      return null;
    }

    if (data.licenseKey !== licenseKey) {
      return null;
    }

    return {
      validated: true,
      key: data.key,
      email: data.email,
      registeredAt: data.registeredAt,
      lastCheckedAt: new Date().getTime(),
    };
  }

  async storeLicense(license: License): Promise<void> {
    const prefs = await this.prefsStore.loadPreferences();
    const encryptedBase64 = this.cipher.encrypt(license);
    prefs.license = encryptedBase64;
    await this.prefsStore.savePreferences(prefs);
  }

  async retrieveLicense(): Promise<License | null> {
    const prefs = await this.prefsStore.loadPreferences();
    if (!prefs.license) {
      return null;
    }
    return this.cipher.decrypt(prefs.license);
  }
}
