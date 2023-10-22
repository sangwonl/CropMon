/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */

import { ipcRenderer } from 'electron';
import React, { useCallback, useState } from 'react';

import type { Preferences } from '@domain/models/preferences';

import { PrefsPanels } from '@adapters/ui/components/stateless/PrefsPanels';
import { useUseCaseInteractor } from '@adapters/ui/hooks/interactor';
import { usePlatformApi } from '@adapters/ui/hooks/platform';
import { IPC_EVT_ON_CLOSE } from '@adapters/ui/widgets/preferences/shared';

interface PropTypes {
  appName: string;
  version: string;
  preferences: Preferences;
}

export function PreferencesDialog({
  appName,
  version,
  preferences,
}: PropTypes) {
  const interactor = useUseCaseInteractor();
  const platformApi = usePlatformApi();

  const [prefs, setPrefs] = useState<Preferences>(preferences);
  const [recordHome, setRecordHome] = useState<string>(preferences.recordHome);

  const handleRecordHome = useCallback(() => {
    const defaultPath = prefs.recordHome ?? platformApi.getPath('videos');
    platformApi.promptDirectory(defaultPath).then(setRecordHome);
  }, [prefs]);

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
      recordHome={recordHome}
      onChooseRecordHome={handleRecordHome}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
}
