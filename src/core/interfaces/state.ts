/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import { initialUiState, IUiState } from '@core/entities/ui';

export interface IUiStateApplier {
  apply(newState: IUiState): void;
}

@injectable()
export class StateManager {
  constructor(
    @inject(TYPES.UiStateApplier) private uiStateApplier: IUiStateApplier
  ) {}

  private uiState: IUiState = initialUiState;

  updateUiState(updater: (state: IUiState) => IUiState) {
    const newState = updater(this.uiState);
    this.uiState = newState;
    this.uiStateApplier.apply(this.uiState);
  }
}
