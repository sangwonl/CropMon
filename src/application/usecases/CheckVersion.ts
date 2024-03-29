import { inject, injectable } from 'inversify';
import semver from 'semver';

import { TYPES } from '@di/types';

import type { PreferencesRepository } from '@domain/repositories/preferences';

import type { AppManager } from '@application/ports/app';
import { HookManager } from '@application/services/hook';
import type { UseCase } from '@application/usecases/UseCase';

@injectable()
export class CheckVersionUseCase implements UseCase<void> {
  constructor(
    @inject(TYPES.PreferencesRepository)
    private prefsRepo: PreferencesRepository,
    @inject(TYPES.AppManager) private appManager: AppManager,
    private hookManager: HookManager,
  ) {}

  async execute() {
    const prefs = await this.prefsRepo.fetchPreferences();
    const oldVersion = prefs.version;
    const curVersion = this.appManager.getCurAppVersion();

    if (curVersion !== oldVersion) {
      prefs.version = curVersion;
      await this.prefsRepo.updatePreference(prefs);
    }

    if (semver.gt(curVersion, oldVersion)) {
      this.hookManager.emit('onAppUpdated', { oldVersion, curVersion });
    }
  }
}
