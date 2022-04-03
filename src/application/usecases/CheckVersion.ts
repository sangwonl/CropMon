/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable } from 'inversify';
import semver from 'semver';

import TYPES from '@di/types';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';

import PreferencesRepository from '@adapters/repositories/preferences';
import AppUpdater from '@adapters/updater';

@injectable()
export default class CheckVersionUseCase implements UseCase<void> {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.AppUpdater) private appUpdater: AppUpdater,
    private hookManager: HookManager
  ) {}

  async execute() {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    const oldVersion = prefs.version;
    const curVersion = this.appUpdater.getCurAppVersion();

    if (curVersion !== oldVersion) {
      prefs.version = curVersion;
      await this.prefsRepo.updateUserPreference(prefs);
    }

    if (semver.gt(curVersion, oldVersion)) {
      this.hookManager.emit('app-updated', { oldVersion, curVersion });
    }
  }
}
