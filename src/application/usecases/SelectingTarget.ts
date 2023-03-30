import { injectable } from 'inversify';

import { Bounds, Point } from '@domain/models/screen';

import { UiState } from '@application/models/ui';
import StateManager from '@application/services/state';
import { UseCase } from '@application/usecases/UseCase';

interface SelectingTargetUseCaseInput {
  targetBounds: Bounds;
  cursorPosition: Point;
}

@injectable()
export default class SelectingTargetUseCase
  implements UseCase<SelectingTargetUseCaseInput>
{
  constructor(private stateManager: StateManager) {}

  execute(input: SelectingTargetUseCaseInput) {
    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          selectingBounds: input.targetBounds,
          curCursorPosition: input.cursorPosition,
        },
      };
    });
  }
}
