import { injectable } from 'inversify';

import { CaptureOptions } from '@domain/models/capture';
import { UiState } from '@domain/models/ui';

import { UseCase } from '@application/usecases/UseCase';
import StateManager from '@application/services/state';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/capture/mode';
import PreferencesRepository from '@application/repositories/preferences';

interface ChangeCaptureOptionsUseCaseInput {
  captureOptions: CaptureOptions;
}

@injectable()
export default class ChangeCaptureOptionsUseCase
  implements UseCase<ChangeCaptureOptionsUseCaseInput>
{
  constructor(
    private prefsRepo: PreferencesRepository,
    private stateManager: StateManager,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager
  ) {}
  async execute(input: ChangeCaptureOptionsUseCaseInput) {
    const { captureOptions: options } = input;

    const prefs = await this.prefsRepo.fetchUserPreferences();

    if (prefs.captureMode !== options.target.mode) {
      this.captureModeManager.enableCaptureMode(options.target.mode);
      prefs.captureMode = options.target.mode;
    }

    this.prefsRepo.applyRecOptionsToPrefs(prefs, options.recordOptions);

    await this.prefsRepo.updateUserPreference(prefs);

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        controlPanel: {
          captureMode: options.target.mode,
          outputAsGif:
            options.recordOptions.enableOutputAsGif ??
            prefs.outputFormat === 'gif',
          lowQualityMode:
            options.recordOptions.enableLowQualityMode ??
            prefs.recordQualityMode === 'low',
          microphone:
            options.recordOptions.enableMicrophone ?? prefs.recordMicrophone,
          confirmedToCaptureAsIs: false,
        },
      };
    });

    this.hookManager.emit('capture-options-changed', {});
  }
}
