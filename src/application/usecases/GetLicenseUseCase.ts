import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { License } from '@domain/models/license';

import { LicenseManager } from '@application/ports/license';
import { UseCase } from '@application/usecases/UseCase';

interface GetLicenseUseCaseOutput {
  license: License | null;
}

@injectable()
export default class GetLicenseUseCase implements UseCase<void> {
  constructor(
    @inject(TYPES.LicenseManager) private licenseManager: LicenseManager
  ) {}

  async execute(): Promise<GetLicenseUseCaseOutput> {
    const license = await this.licenseManager.retrieveLicense();
    return { license };
  }
}
