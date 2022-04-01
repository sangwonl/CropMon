/* eslint-disable prettier/prettier */

import { CaptureMode } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';
import { Preferences } from '@domain/models/preferences';

export interface UiDirector {
  initialize(): void;
  refreshTrayState(prefs: Preferences, updatable?: boolean, recording?: boolean): Promise<void>;
  toggleRecordingTime(activate: boolean): void;
  quitApplication(): void;
  openAboutPageModal(prefs: Preferences): Promise<void>;
  openReleaseNotesModal(): Promise<void>;
  openHelpPageModal(): Promise<void>;
  openPreferencesModal(preferences: Preferences, onSave: (updatedPrefs: Preferences) => void): Promise<void>;
  enableCaptureMode(mode: CaptureMode, onActiveScreenBoundsChange: (bounds: Bounds, screenId?: number) => void): void;
  disableCaptureMode(): void;
  startTargetSelection(): void;
  resetScreenBoundsDetector(): void;
  enableRecordingMode(): void;
  showItemInFolder(path: string): void;
  startDownloadAndInstall(onReady: () => void, onCancel: () => void, onQuitAndInstall: () => void): Promise<void>;
  setUpdateDownloadProgress(percent: number): void;
}
