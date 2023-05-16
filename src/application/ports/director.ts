import { CaptureMode } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';
import { Screen } from '@domain/models/screen';

export enum TrayRecordingState {
  Ready = 0,
  Recording = 1,
}

export enum TrayUpdaterState {
  NonAvailable = 0,
  Checkable = 1,
  Updatable = 2,
}

export interface UiDirector {
  initialize(): void;
  updateTrayPrefs(prefs: Preferences): void;
  updateTrayRecording(state: TrayRecordingState): void;
  updateTrayUpdater(state: TrayUpdaterState): void;
  toggleRecordingTime(activate: boolean): void;
  openReleaseNotes(): Promise<void>;
  openPreferences(
    appName: string,
    version: string,
    preferences: Preferences
  ): Promise<void>;
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
