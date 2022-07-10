import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { PreferencesRepository } from '@domain/repositories/preferences';

import { UseCase } from '@application/usecases/UseCase';
import { UiDirector } from '@application/ports/director';

@injectable()
export default class OpenCaptureFolderUseCase implements UseCase<void> {
  public constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    this.uiDirector.revealFolder(prefs.recordHome);
  }
}
