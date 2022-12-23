import logger from 'electron-log';
import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import CaptureSession from '@domain/services/capture';
import { RecorderSource } from '@domain/services/recorder';

import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';
import { UseCase } from '@application/usecases/UseCase';

import PreferencesRepository from '@adapters/repositories/preferences';

@injectable()
export default class EnableCaptureUseCase implements UseCase<void> {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.RecorderSource) private recorderSource: RecorderSource,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager,
    private captureSession: CaptureSession
  ) {}

  async execute() {
    await this.updateAudioSources();

    if (!this.captureSession.isIdle()) {
      return;
    }

    const prefs = await this.prefsRepo.fetchUserPreferences();
    const lastCaptureMode = prefs.captureMode;

    this.captureModeManager.enableCaptureMode(lastCaptureMode);

    this.captureSession.selecting();

    this.hookManager.emit('capture-mode-enabled', {
      captureMode: lastCaptureMode,
    });
  }

  public async updateAudioSources(): Promise<void> {
    const audioSources = await this.recorderSource.fetchAudioSources();
    audioSources.forEach((s) => logger.info(s.name));
  }
}
