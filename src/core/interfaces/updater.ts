/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IAppUpdater {
  getCurAppVersion(): string;

  checkForUpdates(
    onUpdateAvailable: () => void,
    onUpdateNotAvailable: () => void,
    onDownloadProgress: (progressInfo: any) => void,
    onUpdateDownloaded: () => void
  ): Promise<void>;

  cancelUpdate(): void;
  downloadUpdate(): void;
}
