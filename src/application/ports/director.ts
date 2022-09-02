/* eslint-disable prettier/prettier */

import { CaptureMode } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';
import { Screen } from '@domain/models/screen';

export interface UiDirector {
  initialize(): void;
  refreshTrayState(prefs: Preferences, updatable?: boolean, recording?: boolean): Promise<void>;
  toggleRecordingTime(activate: boolean): void;
  quitApplication(): void;
  openAboutPageModal(prefs: Preferences): Promise<void>;
  openReleaseNotesModal(): Promise<void>;
  openHelpPageModal(): Promise<void>;
  openPreferencesModal(preferences: Preferences, onSave: (updatedPrefs: Preferences) => void): Promise<void>;
  enableCaptureMode(mode: CaptureMode, onActiveScreenBoundsChange: (screens: Screen[], screenCursorOn?: Screen) => void): void;
  disableCaptureMode(): void;
  startTargetSelection(): void;
  resetScreenBoundsDetector(): void;
  enableUserInteraction(): void;
  revealItemInFolder(path: string): void;
  revealFolder(path: string): void;
  startDownloadAndInstall(onReady: () => void, onCancel: () => void, onQuitAndInstall: () => void): Promise<void>;
  setUpdateDownloadProgress(percent: number): void;
}
