import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { Preferences } from '@domain/models/preferences';
import { PreferencesRepository } from '@domain/repositories/preferences';

import { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';
import { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class OpenPrefsModalUseCase implements UseCase<void> {
  public constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    private hookManager: HookManager
  ) {}

  async execute() {
    this.hookManager.emit('prefs-modal-opening', {});

    const prefs = await this.prefsRepo.fetchUserPreferences();
    await this.uiDirector.openPreferencesModal(
      prefs,
      (updatedPrefs: Preferences) => {
        if (updatedPrefs !== undefined) {
          this.prefsRepo.updateUserPreference(updatedPrefs);
        }
      }
    );
  }
}
