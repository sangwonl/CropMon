import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { INITIAL_UI_STATE, type UiState } from '@application/models/ui';
import type { UiStateApplier } from '@application/ports/state';

@injectable()
export default class StateManager {
  constructor(
    @inject(TYPES.UiStateApplier) private uiStateApplier: UiStateApplier,
  ) {}

  private uiState: UiState = INITIAL_UI_STATE;

  updateUiState(updater: (state: UiState) => UiState) {
    const newState = updater(this.uiState);
    this.uiState = newState;
    this.uiStateApplier.apply(this.uiState);
  }

  queryUiState(getter: (state: UiState) => void) {
    getter(this.uiState);
  }
}
