/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */

import { ipcRenderer } from 'electron';
import React, { useCallback, useEffect, useState } from 'react';

import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';

import PrefsPanels from '@adapters/ui/components/stateless/PrefsPanels';
import { useUseCaseInteractor } from '@adapters/ui/hooks/interactor';
import { usePlatformApi } from '@adapters/ui/hooks/platform';
import { IPC_EVT_ON_CLOSE } from '@adapters/ui/widgets/preferences/shared';

interface PropTypes {
  version: string;
  preferences: Preferences;
}

function PreferencesDialog({ version, preferences }: PropTypes) {
  const interactor = useUseCaseInteractor();
  const platformApi = usePlatformApi();

  const [prefs, setPrefs] = useState<Preferences>(preferences);
  const [license, setLicense] = useState<License | null>(null);
  const [recordHome, setRecordHome] = useState<string>(preferences.recordHome);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleRecordHome = useCallback(() => {
    const defaultPath = prefs.recordHome ?? platformApi.getPath('videos');
    platformApi.promptDirectory(defaultPath).then(setRecordHome);
  }, [prefs]);

  const handleRegister = useCallback((email: string, licenseKey: string) => {
    setRegisterError(null);
    interactor.registerLicense(email, licenseKey).then((validatedLicense) => {
      if (validatedLicense) {
        setLicense(validatedLicense);
      } else {
        setRegisterError('Invalid license!');
      }
    });
  }, []);

  useEffect(() => {
    interactor.getLicense().then(setLicense);
  }, []);

  const handleSave = useCallback((newPrefs: Preferences) => {
    interactor.savePreferences(newPrefs).then(setPrefs);
  }, []);

  const handleClose = useCallback(() => {
    ipcRenderer.send(IPC_EVT_ON_CLOSE);
  }, []);

  return (
    <PrefsPanels
      version={version}
      prefs={prefs}
      license={license}
      registerError={registerError}
      recordHome={recordHome}
      onChooseRecordHome={handleRecordHome}
      onRegister={handleRegister}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
}

export default PreferencesDialog;
