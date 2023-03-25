import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { Preferences } from '@domain/models/preferences';
import { PreferencesRepository } from '@domain/repositories/preferences';

import { UiDirector } from '@application/ports/director';
import { LicenseManager } from '@application/ports/license';
import HookManager from '@application/services/hook';
import { UseCase } from '@application/usecases/UseCase';

import { version as curVersion } from '../../package.json';

@injectable()
export default class OpenPrefsModalUseCase implements UseCase<void> {
  public constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.LicenseManager) private licenseManager: LicenseManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    private hookManager: HookManager
  ) {}

  async execute() {
    this.hookManager.emit('onPrefsModalOpening', {});

    const license = this.licenseManager.retrieveLicense();

    const prefs = await this.prefsRepo.fetchUserPreferences();
    await this.uiDirector.openPreferencesModal(
      curVersion,
      prefs,
      license,
      (updatedPrefs: Preferences) => {
        if (updatedPrefs !== undefined) {
          this.prefsRepo.updateUserPreference(updatedPrefs);
        }
      },
      (licenseKey: string) => {
        return license;
      }
    );
  }
}
