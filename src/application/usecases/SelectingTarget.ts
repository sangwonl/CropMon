import { injectable } from 'inversify';

import { UiState } from '@application/models/ui';
import { UseCase } from '@application/usecases/UseCase';
import StateManager from '@application/services/ui/state';
import { Bounds, Point } from '@domain/models/screen';

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
