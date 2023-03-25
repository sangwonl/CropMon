import { CaptureMode } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';
import { Screen } from '@domain/models/screen';

export interface UiDirector {
  initialize(): void;
  refreshTrayState(
    prefs: Preferences,
    updatable?: boolean,
    recording?: boolean
  ): Promise<void>;
  toggleRecordingTime(activate: boolean): void;
  quitApplication(): void;
  openReleaseNotes(): Promise<void>;
  openPreferences(version: string, preferences: Preferences): Promise<void>;
  enableCaptureMode(
    mode: CaptureMode,
    onActiveScreenBoundsChange: (
      screens: Screen[],
      screenCursorOn?: Screen
    ) => void
  ): void;
  disableCaptureMode(): void;
  startTargetSelection(): void;
  resetScreenBoundsDetector(): void;
  enableUserInteraction(): void;
  revealItemInFolder(path: string): void;
  revealFolder(path: string): void;
  startDownloadAndInstall(
    onReady: () => void,
    onCancel: () => void,
    onQuitAndInstall: () => void
  ): Promise<void>;
  progressUpdateDownload(percent: number): void;
  openPostProcessDialog(): Promise<boolean>;
  closePostProcessDialog(): void;
  progressPostProcess(percent: number): void;
  updatePostProcessMsg(message: string): void;
}
