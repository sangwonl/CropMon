import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import type { Bounds, Point } from '@domain/models/screen';

import type { UiState } from '@application/models/ui';
import type { UiDirector } from '@application/ports/director';
import HookManager from '@application/services/hook';
import StateManager from '@application/services/state';
import type { UseCase } from '@application/usecases/UseCase';

interface StartSelectionUseCaseInput {
  targetBounds: Bounds;
  cursorPosition: Point;
}

@injectable()
export default class StartSelectionUseCase
  implements UseCase<StartSelectionUseCaseInput>
{
  constructor(
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    private stateManager: StateManager,
    private hookManager: HookManager,
  ) {}

  execute(input: StartSelectionUseCaseInput) {
    this.uiDirector.startTargetSelection();

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        controlPanel: {
          ...state.controlPanel,
          show: false,
        },
        captureOverlay: {
          ...state.captureOverlay,
          selectingBounds: input.targetBounds,
          startCursorPosition: input.cursorPosition,
        },
      };
    });

    this.hookManager.emit('onCaptureSelectionStarting', {});
  }
}
