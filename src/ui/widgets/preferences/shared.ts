/* eslint-disable @typescript-eslint/no-empty-interface */

import { IPreferences } from '@core/entities/preferences';

export interface PreferencesModalOptions {
  preferences: IPreferences;
}

export const IPC_EVT_ON_PREFS_UPDATED = 'on-prefs-updated';
export const IPC_EVT_ON_RECORD_HOME_SELECTION = 'on-rec-home-selection';
export const IPC_EVT_ON_TOGGLE_OPEN_RECORD_HOME = 'on-toggle-open-rec-home';
export const IPC_EVT_ON_SHORTCUT_CHANGED = 'on-shortcut-changed';
export const IPC_EVT_ON_CLOSE = 'on-close';

export interface IpcEvtOnPrefsUpdated {
  preferences: IPreferences;
}

export interface IpcEvtOnToggleOpenRecordHome {
  shouldOpen: boolean;
}

export interface IpcEvtOnShortcutChanged {
  shortcut: string;
}

export interface IpcEvtOnClose {
  shouldSave: boolean;
}
