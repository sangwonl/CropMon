import { CaptureOptions } from '@domain/models/capture';
import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';
import { Bounds, Point } from '@domain/models/screen';

import { UiState } from '@application/models/ui';

export interface UseCaseInteractor {
  initializeApp(): void;
  checkForUpdates(): void;
  downloadAndInstall(): void;
  showHelp(): void;
  quitApplication(): void;
  openPreferences(): void;
  openCaptureFolder(): void;
  enableCaptureMode(): void;
  disableCaptureMode(): void;
  changeCaptureOptions(options: CaptureOptions): void;
  startTargetSelection(targetBounds: Bounds, cursorPosition: Point): void;
  selectingTarget(targetBounds: Bounds, cursorPosition: Point): void;
  finishTargetSelection(targetBounds: Bounds): void;
  startCapture(): void;
  startCaptureWithCurrentStates(): void;
  finishCapture(): void;
  onCaptureToggleShortcut(): void;
  getUiState(): UiState;
  savePreferences(prefs: Preferences): Promise<Preferences>;
  getLicense(): Promise<License | null>;
}
