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
  openAboutPagePopup(prefs: IPreferences): Promise<void>;
  openReleaseNotesPopup(): Promise<void>;
  openHelpPagePopup(): Promise<void>;
  openPreferencesModal(
    prefs: IPreferences,
    onSave: (updatedPrefs: IPreferences) => void
  ): Promise<void>;
  enableCaptureMode(
    mode: CaptureMode,
    onActiveScreenBoundsChange: (bounds: IBounds) => void
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
