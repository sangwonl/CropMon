/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */

import { ipcRenderer } from 'electron';
import React, { useCallback, useEffect, useState } from 'react';

import type { License } from '@domain/models/license';
import type { Preferences } from '@domain/models/preferences';

import PrefsPanels from '@adapters/ui/components/stateless/PrefsPanels';
import { useUseCaseInteractor } from '@adapters/ui/hooks/interactor';
import { usePlatformApi } from '@adapters/ui/hooks/platform';
import { IPC_EVT_ON_CLOSE } from '@adapters/ui/widgets/preferences/shared';

const LINK_LICENSE_BUY = 'https://cropmon.pineple.com/buy';

interface PropTypes {
  appName: string;
  version: string;
  preferences: Preferences;
}

function PreferencesDialog({ appName, version, preferences }: PropTypes) {
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
    interactor.registerLicense(email, licenseKey).then(validatedLicense => {
      if (validatedLicense) {
        setLicense(validatedLicense);
      } else {
        setRegisterError('Invalid license!');
      }
    });
  }, []);

  const handleBuyClick = useCallback(() => {
    interactor.openExternal(LINK_LICENSE_BUY);
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
      appName={appName}
      version={version}
      prefs={prefs}
      license={license}
      registerError={registerError}
      recordHome={recordHome}
      onChooseRecordHome={handleRecordHome}
      onRegister={handleRegister}
      onBuyClick={handleBuyClick}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
}

export default PreferencesDialog;
