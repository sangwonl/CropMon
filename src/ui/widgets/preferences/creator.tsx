/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { FC, useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

import { IPreferences } from '@core/entities/preferences';
import { Preferences } from '@ui/components/stateless/Preferences';
import { preventZoomKeyEvent } from '@ui/widgets/utils';

import {
  IPC_EVT_ON_CLOSE,
  IPC_EVT_ON_PREFS_UPDATED,
  IPC_EVT_ON_RECORD_HOME_SELECTION,
  IPC_EVT_ON_SAVE,
  IpcEvtOnPrefsUpdated,
  PreferencesModalOptions,
} from '@ui/widgets/preferences/shared';

interface PropTypes {
  initialPrefs: IPreferences;
}

const Wrapper: FC<PropTypes> = (props: PropTypes) => {
  const { initialPrefs } = props;

  const [readyToShow, setReadyToShow] = useState<boolean>(true);
  const [origPrefs, setOrigPrefs] = useState<IPreferences>(initialPrefs);
  const [prefs, setPrefs] = useState<IPreferences>(origPrefs);

  useEffect(() => {
    const handlePrefsUpdated = (_event: any, data: IpcEvtOnPrefsUpdated) => {
      const { oldPrefs, newPrefs } = data;
      setOrigPrefs(oldPrefs);
      setPrefs(newPrefs);
      setReadyToShow(true);
    };
    ipcRenderer.on(IPC_EVT_ON_PREFS_UPDATED, handlePrefsUpdated);
    return () => {
      ipcRenderer.off(IPC_EVT_ON_PREFS_UPDATED, handlePrefsUpdated);
    };
  }, [initialPrefs, setPrefs]);

  return readyToShow ? (
    <Preferences
      origPrefs={origPrefs}
      selectedRecordHome={prefs.recordHome}
      onSave={(preferences: IPreferences) => {
        ipcRenderer.send(IPC_EVT_ON_SAVE, { preferences });
      }}
      onClose={() => {
        ipcRenderer.send(IPC_EVT_ON_CLOSE);
      }}
      onChooseRecordHome={() => {
        ipcRenderer.send(IPC_EVT_ON_RECORD_HOME_SELECTION, { prefs });
      }}
    />
  ) : null;
};

export default (options: PreferencesModalOptions) => {
  const { preferences } = options;
  return <Wrapper initialPrefs={preferences} />;
};

preventZoomKeyEvent();
