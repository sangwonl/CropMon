import type { Preferences } from '@domain/models/preferences';

export type PreferencesDialogOptions = {
  appName: string;
  version: string;
  preferences: Preferences;
};

export const IPC_EVT_ON_CLOSE = 'onClose';
