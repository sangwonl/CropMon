import 'reflect-metadata';

import { IScreenInfo } from '@core/entities/screen';

export interface IUiDirector {
  intialize(): void;
  refreshAppTrayState(): void;
  quitApplication(relaunch?: boolean): void;
  openAboutPopup(): Promise<void>;
  openReleaseNotes(): Promise<void>;
  openPreferencesModal(): void;
  closePreferencesModal(): void;
  openDialogForRecordHomeDir(path?: string): Promise<string>;
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
