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
      onClose={(preferences: IPreferences | undefined) => {
        ipcRenderer.send(IPC_EVT_ON_CLOSE, { preferences });
      }}
      onChooseRecordHome={() => {
        ipcRenderer.send(IPC_EVT_ON_RECORD_HOME_SELECTION, {});
      }}
    />
  );
};

export default () => {
  return <Wrapper />;
};
