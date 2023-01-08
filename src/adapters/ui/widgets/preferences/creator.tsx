/* eslint-disable @typescript-eslint/no-explicit-any */

import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

import { Preferences } from '@domain/models/preferences';

import PreferencesDialog from '@adapters/ui/components/stateless/PreferencesDialog';
import {
  IPC_EVT_ON_CLOSE,
  IPC_EVT_ON_PREFS_UPDATED,
  IPC_EVT_ON_RECORD_HOME_SELECTION,
  IPC_EVT_ON_SAVE,
  IpcEvtOnPrefsUpdated,
  PreferencesModalOptions,
} from '@adapters/ui/widgets/preferences/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

interface PropTypes {
  initialPrefs: Preferences;
}

function Wrapper(props: PropTypes) {
  const { initialPrefs } = props;

  const [readyToShow, setReadyToShow] = useState<boolean>(true);
  const [origPrefs, setOrigPrefs] = useState<Preferences>(initialPrefs);
  const [prefs, setPrefs] = useState<Preferences>(origPrefs);

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
    <PreferencesDialog
      origPrefs={origPrefs}
      selectedRecordHome={prefs.recordHome}
      onSave={(preferences: Preferences) => {
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
}

export default function (options: PreferencesModalOptions) {
  const { preferences } = options;
  return <Wrapper initialPrefs={preferences} />;
}

preventZoomKeyEvent();
