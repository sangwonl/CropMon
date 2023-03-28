import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { License } from '@domain/models/license';

import { LicenseManager } from '@application/ports/license';
import HookManager from '@application/services/hook';
import { UseCase } from '@application/usecases/UseCase';

interface RegisterLicenseUseCaseInput {
  email: string;
  licenseKey: string;
}

interface RegisterLicenseUseCaseOutput {
  license: License | null;
}

@injectable()
export default class RegisterLicenseUseCase
  implements UseCase<RegisterLicenseUseCaseInput>
{
  constructor(
    @inject(TYPES.LicenseManager) private licenseManager: LicenseManager,
    private hookManager: HookManager
  ) {}

  async execute(
    input: RegisterLicenseUseCaseInput
  ): Promise<RegisterLicenseUseCaseOutput> {
    const { email, licenseKey } = input;
    const license = await this.licenseManager.validateLicenseKey(
      email,
      licenseKey
    );

    if (license) {
      await this.licenseManager.storeLicense(license);
      this.hookManager.emit('onLicenseRegistered', { license });
    }

    return { license };
  }
}
