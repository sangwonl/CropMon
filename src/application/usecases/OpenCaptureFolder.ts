import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';

import type { PreferencesRepository } from '@domain/repositories/preferences';

import type { UiDirector } from '@application/ports/director';
import type { UseCase } from '@application/usecases/UseCase';

@injectable()
export class OpenCaptureFolderUseCase implements UseCase<void> {
  public constructor(
    @inject(TYPES.PreferencesRepository)
    private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
  ) {}

  async execute() {
    const prefs = await this.prefsRepo.fetchPreferences();
    this.uiDirector.revealFolder(prefs.recordHome);
  }
}
