export interface AppTray {
  refreshContextMenu(
    shortcut?: string,
    isUpdatable?: boolean,
    isRecording?: boolean
  ): void;
  refreshRecTime(elapsedTimeInSec?: number): void;
}
