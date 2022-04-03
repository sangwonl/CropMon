import { UiState } from '@application/models/ui';

export interface UiStateApplier {
  apply(newState: UiState): void;
}
