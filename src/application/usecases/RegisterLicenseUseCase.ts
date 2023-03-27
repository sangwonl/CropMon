import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { License } from '@domain/models/license';

import { LicenseManager } from '@application/ports/license';
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
    @inject(TYPES.LicenseManager) private licenseManager: LicenseManager
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
    }

    return { license };
  }
}
