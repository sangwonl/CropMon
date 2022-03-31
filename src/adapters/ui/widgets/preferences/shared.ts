import { Preferences } from '@domain/models/preferences';

export interface PreferencesModalOptions {
  preferences: Preferences;
}

export const IPC_EVT_ON_PREFS_UPDATED = 'on-prefs-updated';
export const IPC_EVT_ON_RECORD_HOME_SELECTION = 'on-rec-home-selection';
export const IPC_EVT_ON_SAVE = 'on-save';
export const IPC_EVT_ON_CLOSE = 'on-close';

export interface IpcEvtOnPrefsUpdated {
  oldPrefs: Preferences;
  newPrefs: Preferences;
}

export interface IpcEvtOnSave {
  preferences: Preferences;
}
