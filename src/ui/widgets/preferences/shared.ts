/* eslint-disable @typescript-eslint/no-empty-interface */

import { IPreferences } from '@core/entities/preferences';

export interface PreferencesModalOptions {
  preferences: IPreferences;
}

export const IPC_EVT_ON_PREFS_UPDATED = 'on-prefs-updated';
export const IPC_EVT_ON_RECORD_HOME_SELECTION = 'on-rec-home-selection';
export const IPC_EVT_ON_CLOSE = 'on-close';

export interface IpcEvtOnPrefsUpdated {
  oldPrefs: IPreferences;
  newPrefs: IPreferences;
}

export interface IpcEvtOnClose {
  preferences?: IPreferences;
}
