import { UiState } from '@domain/models/ui';

export interface UiStateApplier {
  apply(newState: UiState): void;
}
