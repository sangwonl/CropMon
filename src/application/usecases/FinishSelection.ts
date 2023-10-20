import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';

import type { Bounds } from '@domain/models/screen';
import type { PreferencesRepository } from '@domain/repositories/preferences';
import { CaptureSession } from '@domain/services/capture';

import type { UiState } from '@application/models/ui';
import type { UiDirector } from '@application/ports/director';
import { HookManager } from '@application/services/hook';
import { StateManager } from '@application/services/state';
import type { UseCase } from '@application/usecases/UseCase';

interface FinishSelectionUseCaseInput {
  targetBounds: Bounds;
}

@injectable()
export class FinishSelectionUseCase
  implements UseCase<FinishSelectionUseCaseInput>
{
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository)
    private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    private stateManager: StateManager,
    private hookManager: HookManager,
    private captureSession: CaptureSession,
  ) {}

  async execute(input: FinishSelectionUseCaseInput) {
    const prefs = await this.prefsRepo.fetchPreferences();

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

    this.hookManager.emit('onCaptureSelectionFinished', {});
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
        outputFormat: controlPanel.outputFormat,
        recordAudio: controlPanel.recordAudio,
        audioSources: controlPanel.audioSources.filter(s => s.active),
      },
    });
  }
}
