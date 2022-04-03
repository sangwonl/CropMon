import { injectable } from 'inversify';

import { UiState } from '@application/models/ui';
import { UseCase } from '@application/usecases/UseCase';
import StateManager from '@application/services/ui/state';

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
