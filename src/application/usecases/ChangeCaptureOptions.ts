/* eslint-disable no-unused-vars */

import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';

import type { CaptureOptions } from '@domain/models/capture';
import type { PreferencesRepository } from '@domain/repositories/preferences';

import type { UiState } from '@application/models/ui';
import { HookManager } from '@application/services/hook';
import { CaptureModeManager } from '@application/services/mode';
import { StateManager } from '@application/services/state';
import type { UseCase } from '@application/usecases/UseCase';

interface ChangeCaptureOptionsUseCaseInput {
  captureOptions: CaptureOptions;
}

@injectable()
export class ChangeCaptureOptionsUseCase
  implements UseCase<ChangeCaptureOptionsUseCaseInput>
{
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository)
    private prefsRepo: PreferencesRepository,
    private stateManager: StateManager,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager,
  ) {}
  async execute(input: ChangeCaptureOptionsUseCaseInput) {
    const { captureOptions: options } = input;

    const prefs = await this.prefsRepo.fetchPreferences();

    if (prefs.captureMode !== options.target.mode) {
      this.captureModeManager.enableCaptureMode(options.target.mode);
      prefs.captureMode = options.target.mode;
    }

    this.prefsRepo.applyRecOptionsToPrefs(prefs, options.recordOptions);

    await this.prefsRepo.updatePreference(prefs);

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        controlPanel: {
          ...state.controlPanel,
          captureMode: options.target.mode,
          outputAsGif: options.recordOptions.outputAsGif,
          recordAudio: options.recordOptions.recordAudio,
          audioSources: options.recordOptions.audioSources,
          confirmedToCaptureAsIs: false,
        },
      };
    });

    this.hookManager.emit('onCaptureOptionsChanged', {
      captureMode: options.target.mode,
    });
  }
}
