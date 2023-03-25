/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */

import { ipcRenderer } from 'electron';
import React, { useCallback, useEffect, useState } from 'react';

import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';

import PrefsPanels from '@adapters/ui/components/stateless/PrefsPanels';
import { useActionDispatcher } from '@adapters/ui/hooks/dispatcher';
import { usePlatformApi } from '@adapters/ui/hooks/platform';
import { IPC_EVT_ON_CLOSE } from '@adapters/ui/widgets/preferences/shared';

interface PropTypes {
  version: string;
  preferences: Preferences;
}

function PreferencesDialog({ version, preferences }: PropTypes) {
  const dispatcher = useActionDispatcher();
  const platformApi = usePlatformApi();

  const [prefs, setPrefs] = useState<Preferences>(preferences);
  const [license, setLicense] = useState<License | null>(null);
  const [recordHome, setRecordHome] = useState<string>(preferences.recordHome);

  useEffect(() => {
    dispatcher.getLicense().then(setLicense);
  }, []);

  const handleRecordHome = useCallback(() => {
    const defaultPath = prefs.recordHome ?? platformApi.getPath('videos');
    platformApi.promptDirectory(defaultPath).then(setRecordHome);
  }, [prefs]);

  const handleRegister = useCallback((licenseKey: string) => {}, []);

  const handleSave = useCallback((newPrefs: Preferences) => {
    dispatcher.savePreferences(newPrefs).then(setPrefs);
  }, []);

  const handleClose = useCallback(() => {
    ipcRenderer.send(IPC_EVT_ON_CLOSE);
  }, []);

  return (
    <PrefsPanels
      version={version}
      prefs={prefs}
      license={license}
      recordHome={recordHome}
      onChooseRecordHome={handleRecordHome}
      onRegister={handleRegister}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
}

export default PreferencesDialog;
