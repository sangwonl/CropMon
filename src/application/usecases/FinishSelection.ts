import { injectable } from 'inversify';

import { Bounds } from '@domain/models/screen';
import { UiState } from '@domain/models/ui';

import { UseCase } from '@application/usecases/UseCase';
import StateManager from '@application/services/state';
import HookManager from '@application/services/hook';
import CaptureSession from '@application/services/capture/session';

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
      this.captureSession.prepareCaptureOptions({
        target: {
          mode: state.controlPanel.captureMode,
          bounds: state.captureOverlay.selectedBounds,
          screenId: state.captureOverlay.selectedScreenId,
        },
        recordOptions: {
          enableOutputAsGif: state.controlPanel.outputAsGif,
          enableLowQualityMode: state.controlPanel.lowQualityMode,
          enableMicrophone: state.controlPanel.microphone,
        },
      });
    });

    this.hookManager.emit('capture-selection-finished', {});
  }
}
