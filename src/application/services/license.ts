import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { TrayUpdaterState, UiDirector } from '@application/ports/director';
import { LicenseManager } from '@application/ports/license';

@injectable()
export default class LicenseService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.LicenseManager) private licenseManager: LicenseManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async checkAndGetLicense() {
    const license = await this.licenseManager.retrieveLicense();
    if (!license?.validated) {
      this.uiDirector.updateTrayUpdater(TrayUpdaterState.NonAvailable);
    } else {
      this.uiDirector.updateTrayUpdater(TrayUpdaterState.Checkable);
    }
    return license;
  }
}
