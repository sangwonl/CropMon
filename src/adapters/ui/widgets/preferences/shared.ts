import { Preferences } from '@domain/models/preferences';

export type PreferencesModalOptions = {
  appName: string;
  version: string;
  preferences: Preferences;
};

export const IPC_EVT_ON_CLOSE = 'onClose';
