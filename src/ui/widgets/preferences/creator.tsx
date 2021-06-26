/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */

import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

import { IPreferences } from '@core/entities/preferences';
import { Preferences } from '@ui/components/stateless/Preferences';
import { getCurWidgetCustomData } from '@utils/remote';

import {
  IPC_EVT_ON_CLOSE,
  IPC_EVT_ON_PREFS_UPDATED,
  IPC_EVT_ON_RECORD_HOME_SELECTION,
  IPC_EVT_ON_TOGGLE_OPEN_RECORD_HOME,
  IPC_EVT_ON_SHORTCUT_CHANGED,
  IpcEvtOnPrefsUpdated,
} from './shared';

const getInitialPrefs = (): IPreferences => {
  return getCurWidgetCustomData<IPreferences>('initialPrefs');
};

const Wrapper = () => {
  const [prefs, setPrefs] = useState<IPreferences>(() => getInitialPrefs());

  useEffect(() => {
    ipcRenderer.on(
      IPC_EVT_ON_PREFS_UPDATED,
      (_event: any, data: IpcEvtOnPrefsUpdated) => {
        setPrefs(data.preferences);
      }
    );
  }, []);

  return (
    <Preferences
      preferences={prefs}
      onClose={(shouldSave: boolean) => {
        ipcRenderer.send(IPC_EVT_ON_CLOSE, { shouldSave });
      }}
      onChooseRecordHome={() => {
        ipcRenderer.send(IPC_EVT_ON_RECORD_HOME_SELECTION, {});
      }}
      onToggleOpenRecordHome={(shouldOpen: boolean) => {
        ipcRenderer.send(IPC_EVT_ON_TOGGLE_OPEN_RECORD_HOME, { shouldOpen });
      }}
      onShortcutChanged={(shortcut: string) => {
        ipcRenderer.send(IPC_EVT_ON_SHORTCUT_CHANGED, { shortcut });
      }}
    />
  );
};

export default () => {
  return <Wrapper />;
};
