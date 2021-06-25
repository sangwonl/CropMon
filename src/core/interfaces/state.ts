/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import { ICaptureContext } from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { initialUiState, IUiState } from '@core/entities/ui';

export interface IUiStateApplier {
  apply(newState: IUiState): void;
}

@injectable()
export class StateManager {
  constructor(
    @inject(TYPES.UiStateApplier) private uiStateApplier: IUiStateApplier
  ) {}

  private curCaptureContext: ICaptureContext | undefined;
  private userPreferences: IPreferences | undefined;
  private uiState: IUiState = initialUiState;

  setCaptureContext(ctx: ICaptureContext) {
    this.curCaptureContext = ctx;
  }

  getCaptureContext(): ICaptureContext | undefined {
    return this.curCaptureContext;
  }

  setUserPreferences(pref: IPreferences) {
    this.userPreferences = pref;
  }

  getUserPreferences(): IPreferences | undefined {
    return this.userPreferences;
  }

  updateUiState(updater: (state: IUiState) => IUiState) {
    const newState = updater(this.uiState);
    this.uiState = newState;
    this.uiStateApplier.apply(this.uiState);
  }
}
