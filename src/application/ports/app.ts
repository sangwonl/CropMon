/* eslint-disable no-unused-vars */

export interface AppManager {
  getCurAppVersion(): string;
  isFreeVersion(): boolean;
  checkForUpdates(
    onUpdateAvailable: () => void,
    onUpdateNotAvailable: () => void,
    onDownloadProgress: (progressInfo: {
      total: number;
      transferred: number;
    }) => void,
    onUpdateDownloaded: () => void,
  ): Promise<void>;
  cancelUpdate(): void;
  downloadUpdate(): void;
  quitAndInstall(): void;
  quit(): void;
}
