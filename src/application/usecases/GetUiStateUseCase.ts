import { injectable } from 'inversify';

import { INITIAL_UI_STATE, type UiState } from '@application/models/ui';
import StateManager from '@application/services/state';
import type { UseCase } from '@application/usecases/UseCase';

interface GetUiStateUseCaseOutput {
  uiState: UiState;
}

@injectable()
export default class GetUiStateUseCase implements UseCase<void> {
  constructor(private stateManager: StateManager) {}

  execute(): GetUiStateUseCaseOutput {
    const output: GetUiStateUseCaseOutput = { uiState: INITIAL_UI_STATE };
    this.stateManager.queryUiState((uiState: UiState) => {
      output.uiState = uiState;
    });
    return output;
  }
}
