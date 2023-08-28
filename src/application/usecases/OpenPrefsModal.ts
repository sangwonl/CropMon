import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';

import type { PreferencesRepository } from '@domain/repositories/preferences';

import type { UiDirector } from '@application/ports/director';
import { HookManager } from '@application/services/hook';
import type { UseCase } from '@application/usecases/UseCase';

import { version as curVersion, productName } from '../../package.json';

@injectable()
export class OpenPrefsModalUseCase implements UseCase<void> {
  public constructor(
    @inject(TYPES.PreferencesRepository)
    private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    private hookManager: HookManager,
  ) {}

  async execute() {
    this.hookManager.emit('onPrefsModalOpening', {});

    const prefs = await this.prefsRepo.fetchPreferences();
    await this.uiDirector.openPreferences(productName, curVersion, prefs);
  }
}
