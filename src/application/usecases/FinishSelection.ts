import { injectable } from 'inversify';

import { Bounds } from '@domain/models/screen';
import CaptureSession from '@domain/services/capture';

import { UiState } from '@application/models/ui';
import { UseCase } from '@application/usecases/UseCase';
import StateManager from '@application/services/ui/state';
import HookManager from '@application/services/hook';

interface FinishSelectionUseCaseInput {
  targetBounds: Bounds;
}

@injectable()
export default class FinishSelectionUseCase
  implements UseCase<FinishSelectionUseCaseInput>
{
  constructor(
    private stateManager: StateManager,
    private hookManager: HookManager,
    private captureSession: CaptureSession
  ) {}

  async execute(input: FinishSelectionUseCaseInput) {
    const { targetBounds } = input;

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          selectedBounds: targetBounds,
          isSelecting: false,
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
    this.captureSession.prepareCapture({
      target: {
        mode: controlPanel.captureMode,
        bounds: captureOverlay.selectedBounds,
        screenId: captureOverlay.selectedScreenId,
      },
      recordOptions: {
        enableOutputAsGif: controlPanel.outputAsGif,
        enableLowQualityMode: controlPanel.lowQualityMode,
        enableMicrophone: controlPanel.microphone,
      },
    });
  }
}
