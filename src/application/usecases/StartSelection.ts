import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { Bounds } from '@domain/models/screen';

import { UiState } from '@application/models/ui';
import { UseCase } from '@application/usecases/UseCase';
import StateManager from '@application/services/ui/state';
import HookManager from '@application/services/hook';
import { UiDirector } from '@application/ports/director';

interface StartSelectionUseCaseInput {
  targetBounds: Bounds;
}

@injectable()
export default class StartSelectionUseCase
  implements UseCase<StartSelectionUseCaseInput>
{
  constructor(
    private stateManager: StateManager,
    private hookManager: HookManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  execute(input: StartSelectionUseCaseInput) {
    this.uiDirector.startTargetSelection();

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          selectingBounds: input.targetBounds,
        },
      };
    });

    this.hookManager.emit('capture-selection-starting', {});
  }
}
