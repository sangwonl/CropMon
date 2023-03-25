/* eslint-disable @typescript-eslint/no-explicit-any */

import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';

import PreferencesDialog from '@adapters/ui/components/stateless/PreferencesDialog';
import { useForceRenderer } from '@adapters/ui/hooks/render';
import {
  IPC_EVT_ON_CLOSE,
  IPC_EVT_ON_LICENSE_UPDATED,
  IPC_EVT_ON_PREFS_UPDATED,
  IPC_EVT_ON_RECORD_HOME_SELECTION,
  IPC_EVT_ON_REGISTER,
  IPC_EVT_ON_SAVE,
  IpcEvtOnLicenseUpdated,
  IpcEvtOnPrefsUpdated,
  PreferencesModalOptions,
} from '@adapters/ui/widgets/preferences/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

export default function PreferencesModalCreator(
  options: PreferencesModalOptions
) {
  const {
    version,
    license: initialLicense,
    preferences: initialPrefs,
  } = options;

  const [shouldRender, forceToRender] = useForceRenderer();
  const [origLicense, setOrigLicense] = useState<License | null>(
    initialLicense
  );
  const [license, setLicense] = useState<License | null>(origLicense);
  const [origPrefs, setOrigPrefs] = useState<Preferences>(initialPrefs);
  const [prefs, setPrefs] = useState<Preferences>(origPrefs);

  useEffect(() => {
    const handleLicenseUpdated = (
      _event: any,
      data: IpcEvtOnLicenseUpdated
    ) => {
      const { oldLicense, newLicense } = data;
      setOrigLicense(oldLicense);
      setLicense(newLicense);
      forceToRender();
    };

    const handlePrefsUpdated = (_event: any, data: IpcEvtOnPrefsUpdated) => {
      const { oldPrefs, newPrefs } = data;
      setOrigPrefs(oldPrefs);
      setPrefs(newPrefs);
      forceToRender();
    };
    ipcRenderer.on(IPC_EVT_ON_LICENSE_UPDATED, handleLicenseUpdated);
    ipcRenderer.on(IPC_EVT_ON_PREFS_UPDATED, handlePrefsUpdated);
    return () => {
      ipcRenderer.off(IPC_EVT_ON_LICENSE_UPDATED, handleLicenseUpdated);
      ipcRenderer.off(IPC_EVT_ON_PREFS_UPDATED, handlePrefsUpdated);
    };
  }, [initialPrefs, initialLicense]);

  return shouldRender ? (
    <PreferencesDialog
      version={version}
      license={origLicense}
      prefs={origPrefs}
      selectedRecordHome={prefs.recordHome}
      onChooseRecordHome={() => {
        ipcRenderer.send(IPC_EVT_ON_RECORD_HOME_SELECTION, { prefs });
      }}
      onRegister={(licenseKey: string) => {
        ipcRenderer.send(IPC_EVT_ON_REGISTER, { licenseKey });
      }}
      onSave={(preferences: Preferences) => {
        ipcRenderer.send(IPC_EVT_ON_SAVE, { preferences });
      }}
      onClose={() => {
        ipcRenderer.send(IPC_EVT_ON_CLOSE);
      }}
    />
  ) : (
    <div />
  );
}

preventZoomKeyEvent();
