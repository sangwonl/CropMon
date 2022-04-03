/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UseCase } from '@application/usecases/UseCase';
import { UiDirector } from '@application/ports/director';

import PreferencesRepository from '@adapters/repositories/preferences';

@injectable()
export default class OpenAboutPopupUseCase implements UseCase<void> {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    await this.uiDirector.openAboutPageModal(prefs);
  }
}
