/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */

import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

import { IPreferences } from '@core/entities/preferences';
import Preferences from '@ui/components/stateless/Preferences';
import { preventZoomKeyEvent } from '@ui/widgets/utils';
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
  const [readyToShow, setReadyToShow] = useState<boolean>(true);
  const [origPrefs, setOrigPrefs] = useState<IPreferences>(getInitialPrefs());
  const [prefs, setPrefs] = useState<IPreferences>(origPrefs);

  useEffect(() => {
    const handlePrefsUpdated = (_event: any, data: IpcEvtOnPrefsUpdated) => {
      setPrefs(data.preferences);
      setOrigPrefs(getInitialPrefs());
      setReadyToShow(true);
    };
    ipcRenderer.on(IPC_EVT_ON_PREFS_UPDATED, handlePrefsUpdated);
    return () => {
      ipcRenderer.off(IPC_EVT_ON_PREFS_UPDATED, handlePrefsUpdated);
    };
  }, [setPrefs]);

  return readyToShow ? (
    <Preferences
      origPrefs={origPrefs}
      selectedRecordHome={prefs.recordHome}
      onClose={(preferences?: IPreferences) => {
        ipcRenderer.send(IPC_EVT_ON_CLOSE, { preferences });
        setReadyToShow(false);
      }}
      onChooseRecordHome={() => {
        ipcRenderer.send(IPC_EVT_ON_RECORD_HOME_SELECTION, {});
      }}
    />
  ) : null;
};

export default () => {
  return <Wrapper />;
};

preventZoomKeyEvent();
