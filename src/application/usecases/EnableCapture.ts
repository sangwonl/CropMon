import { injectable } from 'inversify';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/capture/mode';
import PreferencesRepository from '@application/repositories/preferences';

@injectable()
export default class EnableCaptureUseCase implements UseCase<void> {
  constructor(
    private prefsRepo: PreferencesRepository,
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
