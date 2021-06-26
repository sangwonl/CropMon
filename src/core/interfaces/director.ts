import 'reflect-metadata';

import { IScreenInfo } from '@core/entities/screen';
import { IPreferences } from '@core/entities/preferences';

export interface IUiDirector {
  initialize(prefs: IPreferences): void;
  refreshTrayState(prefs: IPreferences, recording: boolean): Promise<void>;
  quitApplication(relaunch?: boolean): void;
  openAboutPopup(prefs: IPreferences): Promise<void>;
  openReleaseNotes(): Promise<void>;
  openPreferencesModal(prefs: IPreferences): Promise<IPreferences | undefined>;
  enableCaptureSelectionMode(): Array<IScreenInfo>;
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
