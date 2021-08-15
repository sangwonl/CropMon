import { IBounds } from '@core/entities/screen';
import { IPreferences } from '@core/entities/preferences';

export interface IUiDirector {
  initialize(): void;
  refreshTrayState(prefs: IPreferences, recording?: boolean): Promise<void>;
  quitApplication(): void;
  openAboutPagePopup(prefs: IPreferences): Promise<void>;
  openReleaseNotesPopup(): Promise<void>;
  openHelpPagePopup(): Promise<void>;
  openPreferencesModal(prefs: IPreferences): Promise<IPreferences | undefined>;
  enableCaptureSelectionMode(): IBounds;
  disableCaptureSelectionMode(): void;
  enableRecordingMode(): void;
  showItemInFolder(path: string): void;
  openUpdateAvailableDialog(): Promise<number>;
  startDownloadUpdate(
    onReady: () => void,
    onCancel: () => void,
    onQuit: () => void
  ): Promise<void>;
  setUpdateDownloadProgress(percent: number): void;
}
