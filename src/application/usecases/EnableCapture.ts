import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import CaptureSession from '@domain/services/capture';

import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';
import { UseCase } from '@application/usecases/UseCase';

import PreferencesRepository from '@adapters/repositories/preferences';

@injectable()
export default class EnableCaptureUseCase implements UseCase<void> {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager,
    private captureSession: CaptureSession
  ) {}

  async execute() {
    if (!this.captureSession.isIdle()) {
      return;
    }

    const prefs = await this.prefsRepo.fetchUserPreferences();
    const lastCaptureMode = prefs.captureMode;

    this.captureModeManager.enableCaptureMode(lastCaptureMode);

    this.captureSession.selecting();

    this.hookManager.emit('onCaptureModeEnabled', {
      captureMode: lastCaptureMode,
    });
  }
}
