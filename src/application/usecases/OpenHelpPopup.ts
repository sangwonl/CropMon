/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UiDirector } from '@application/ports/director';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class OpenHelpPopupUseCase implements UseCase<void> {
  constructor(@inject(TYPES.UiDirector) private uiDirector: UiDirector) {}

  async execute() {
    await this.uiDirector.openHelpPageModal();
  }
}
