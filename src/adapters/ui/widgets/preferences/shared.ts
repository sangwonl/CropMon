import { Preferences } from '@domain/models/preferences';

export type PreferencesModalOptions = {
  preferences: Preferences;
};

export const IPC_EVT_ON_PREFS_UPDATED = 'on-onPrefsUpdated';
export const IPC_EVT_ON_RECORD_HOME_SELECTION = 'on-rec-home-selection';
export const IPC_EVT_ON_SAVE = 'on-save';
export const IPC_EVT_ON_CLOSE = 'on-close';

export type IpcEvtOnPrefsUpdated = {
  oldPrefs: Preferences;
  newPrefs: Preferences;
};

export type IpcEvtOnSave = {
  preferences: Preferences;
};
