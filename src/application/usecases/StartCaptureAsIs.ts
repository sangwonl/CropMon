import { injectable } from 'inversify';

import type { UiState } from '@application/models/ui';
import StateManager from '@application/services/state';
import type { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class StartCaptureAsIsUseCase implements UseCase<void> {
  constructor(private stateManager: StateManager) {}

  execute(): void {
    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        controlPanel: {
          ...state.controlPanel,
          confirmedToCaptureAsIs: true,
        },
      };
    });
  }
}
