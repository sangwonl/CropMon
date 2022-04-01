/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UseCase } from '@application/usecases/UseCase';
import PreferencesRepository from '@application/repositories/preferences';
import { UiDirector } from '@application/ports/director';

@injectable()
export default class OpenAboutPopupUseCase implements UseCase<void> {
  constructor(
    private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    await this.uiDirector.openAboutPageModal(prefs);
  }
}
