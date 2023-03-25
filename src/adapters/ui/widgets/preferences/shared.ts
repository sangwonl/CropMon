import { Preferences } from '@domain/models/preferences';

export type PreferencesModalOptions = {
  version: string;
  preferences: Preferences;
};

export const IPC_EVT_ON_CLOSE = 'onClose';
