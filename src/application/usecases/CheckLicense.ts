/* eslint-disable @typescript-eslint/no-explicit-any */

import { injectable } from 'inversify';

import LicenseService from '@application/services/license';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class CheckLicenseUseCase implements UseCase<void> {
  constructor(private licenseService: LicenseService) {}

  async execute() {
    await this.licenseService.checkAndGetLicense();
  }
}
