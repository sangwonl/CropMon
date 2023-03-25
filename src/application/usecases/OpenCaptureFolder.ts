import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { PreferencesRepository } from '@domain/repositories/preferences';

import { UiDirector } from '@application/ports/director';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class OpenCaptureFolderUseCase implements UseCase<void> {
  public constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    const prefs = await this.prefsRepo.fetchPreferences();
    this.uiDirector.revealFolder(prefs.recordHome);
  }
}
