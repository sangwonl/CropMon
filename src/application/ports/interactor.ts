/* eslint-disable no-unused-vars */

import type { CaptureOptions } from '@domain/models/capture';
import type { License } from '@domain/models/license';
import type { Preferences } from '@domain/models/preferences';
import type { Bounds, Point } from '@domain/models/screen';

import type { UiState } from '@application/models/ui';

export interface UseCaseInteractor {
  initializeApp(): void;
  checkForUpdates(): void;
  downloadAndInstall(): void;
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
  registerLicense(email: string, licenseKey: string): Promise<License | null>;
  openExternal(url: string): void;
}
