import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import { INITIAL_UI_STATE, IUiState } from '@core/entities/ui';

export interface IUiStateApplier {
  apply(newState: IUiState): void;
}

@injectable()
export class StateManager {
  constructor(
    @inject(TYPES.UiStateApplier) private uiStateApplier: IUiStateApplier
  ) {}

  private uiState: IUiState = INITIAL_UI_STATE;

  updateUiState(updater: (state: IUiState) => IUiState) {
    const newState = updater(this.uiState);
    this.uiState = newState;
    this.uiStateApplier.apply(this.uiState);
  }

  queryUiState(getter: (state: IUiState) => void) {
    getter(this.uiState);
  }
}
