import type { Preferences } from '@domain/models/preferences';

export interface AppTray {
  syncPrefs(prefs: Preferences): void;
  setRecording(recording: boolean): void;
  setUpdater(checkable: boolean, updatable: boolean): void;
  refreshRecTime(elapsedTimeInSec?: number): void;
}
