/* eslint-disable prettier/prettier */

import { CaptureMode } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';
import { Bounds } from '@domain/models/screen';

export interface UiDirector {
  initialize(): void;
  refreshTrayState(prefs: Preferences, updatable?: boolean, recording?: boolean): Promise<void>;
  toggleRecordingTime(activate: boolean): void;
  quitApplication(): void;
  openAboutPageModal(prefs: Preferences): Promise<void>;
  openReleaseNotesModal(): Promise<void>;
  openHelpPageModal(): Promise<void>;
  openPreferencesModal(preferences: Preferences, onSave: (updatedPrefs: Preferences) => void): Promise<void>;
  enableCaptureMode(mode: CaptureMode): Bounds;
  disableCaptureMode(): void;
  startTargetSelection(): void;
  enableRecordingMode(): void;
  showItemInFolder(path: string): void;
  startDownloadAndInstall(onReady: () => void, onCancel: () => void, onQuitAndInstall: () => void): Promise<void>;
  setUpdateDownloadProgress(percent: number): void;
}
