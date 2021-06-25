/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';

import { IUiStateApplier } from '@core/interfaces/state';
import { IUiState } from '@core/entities/ui';
import store from '@ui/redux/store';
import { updateUiState } from '@ui/redux/slice';

@injectable()
export class UiStateApplier implements IUiStateApplier {
  apply(newState: IUiState): void {
    store.dispatch(updateUiState(newState));
  }
}
