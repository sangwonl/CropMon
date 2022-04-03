import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { UiState } from '@application/models/ui';
import { UseCase } from '@application/usecases/UseCase';
import StateManager from '@application/services/ui/state';
import HookManager from '@application/services/hook';
import { UiDirector } from '@application/ports/director';

@injectable()
export default class StartSelectionUseCase implements UseCase<void> {
  constructor(
    private stateManager: StateManager,
    private hookManager: HookManager,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  execute() {
    this.uiDirector.startTargetSelection();

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          isSelecting: true,
        },
      };
    });

    this.hookManager.emit('capture-selection-starting', {});
  }
}
