import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';

import PreferencesRepository from '@adapters/repositories/preferences';

@injectable()
export default class EnableCaptureUseCase implements UseCase<void> {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager
  ) {}

  async execute() {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    const lastCaptureMode = prefs.captureMode;

    this.captureModeManager.enableCaptureMode(lastCaptureMode);

    this.hookManager.emit('capture-mode-enabled', {
      captureMode: lastCaptureMode,
    });
  }
}