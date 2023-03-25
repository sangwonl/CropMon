import { CaptureMode } from '@domain/models/common';
import { License } from '@domain/models/license';
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
  openReleaseNotesModal(): Promise<void>;
  openPreferencesModal(
    version: string,
    preferences: Preferences,
    license: License | null,
    onSave: (updatedPrefs: Preferences) => void,
    onRegister: (licenseKey: string) => License | null
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
