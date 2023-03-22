import { injectable } from 'inversify';

import { License } from '@domain/models/license';

import { LicenseManager } from '@application/ports/license';

@injectable()
export default class SimpleLicenseManager implements LicenseManager {
  validateLicenseKey(key: string): License | null {
    return null;
  }
  storeLicense(license: License): boolean {
    return false;
  }
  retrieveLicense(): License | null {
    return null;
  }
}
