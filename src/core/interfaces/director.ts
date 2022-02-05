import { CaptureMode } from '@core/entities/common';
import { IBounds } from '@core/entities/screen';
import { IPreferences } from '@core/entities/preferences';

export interface IUiDirector {
  initialize(): void;
  refreshTrayState(
    prefs: IPreferences,
    updatable?: boolean,
    recording?: boolean
  ): Promise<void>;
  toggleRecordingTime(activate: boolean): void;
  quitApplication(): void;
  openAboutPageModal(prefs: IPreferences): Promise<void>;
  openReleaseNotesModal(): Promise<void>;
  openHelpPageModal(): Promise<void>;
  openPreferencesModal(
    prefs: IPreferences,
    onSave: (updatedPrefs: IPreferences) => void
  ): Promise<void>;
  enableCaptureMode(
    mode: CaptureMode,
    onActiveScreenBoundsChange: (bounds: IBounds, screenId?: number) => void
  ): void;
  disableCaptureMode(): void;
  startTargetSelection(): void;
  enableRecordingMode(): void;
  showItemInFolder(path: string): void;
  startDownloadAndInstall(
    onReady: () => void,
    onCancel: () => void,
    onQuit: () => void
  ): Promise<void>;
  setUpdateDownloadProgress(percent: number): void;
}
