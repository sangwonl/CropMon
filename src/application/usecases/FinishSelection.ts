import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { Bounds } from '@domain/models/screen';
import { PreferencesRepository } from '@domain/repositories/preferences';
import CaptureSession from '@domain/services/capture';

import { UiState } from '@application/models/ui';
import { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';
import StateManager from '@application/services/ui/state';
import { UseCase } from '@application/usecases/UseCase';

interface FinishSelectionUseCaseInput {
  targetBounds: Bounds;
}

@injectable()
export default class FinishSelectionUseCase
  implements UseCase<FinishSelectionUseCaseInput>
{
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    private stateManager: StateManager,
    private hookManager: HookManager,
    private captureSession: CaptureSession
  ) {}

  async execute(input: FinishSelectionUseCaseInput) {
    const prefs = await this.prefsRepo.fetchUserPreferences();

    this.uiDirector.enableUserInteraction();

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          isCountingDown: prefs.showCountdown,
          selectingBounds: undefined,
          selectedBounds: input.targetBounds,
        },
      };
    });

    this.stateManager.queryUiState((state: UiState): void => {
      this.prepareForCapture(state);
    });

    this.hookManager.emit('capture-selection-finished', {});
  }

  private prepareForCapture(state: UiState) {
    const { controlPanel, captureOverlay } = state;
    this.captureSession.prepare({
      target: {
        mode: controlPanel.captureMode,
        bounds: captureOverlay.selectedBounds,
        screenId: captureOverlay.selectedScreenId,
      },
      recordOptions: {
        outputAsGif: controlPanel.outputAsGif,
        audioSources: controlPanel.audioSources.filter((s) => s.active),
      },
    });
  }
}
