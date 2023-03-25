import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';

export type PreferencesModalOptions = {
  version: string;
  license: License | null;
  preferences: Preferences;
};

export const IPC_EVT_ON_RECORD_HOME_SELECTION = 'onRecordHomeSelection';
export const IPC_EVT_ON_REGISTER = 'onRegister';
export const IPC_EVT_ON_SAVE = 'onSave';
export const IPC_EVT_ON_CLOSE = 'onClose';
export const IPC_EVT_ON_LICENSE_UPDATED = 'onLicenseUpdated';
export const IPC_EVT_ON_PREFS_UPDATED = 'onPrefsUpdated';

export type IpcEvtOnRegister = {
  licenseKey: string;
};

export type IpcEvtOnSave = {
  preferences: Preferences;
};

export type IpcEvtOnLicenseUpdated = {
  oldLicense: License | null;
  newLicense: License | null;
};

export type IpcEvtOnPrefsUpdated = {
  oldPrefs: Preferences;
  newPrefs: Preferences;
};
