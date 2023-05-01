/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

import PreferencesDialog from '@adapters/ui/components/stateful/PreferencesDialog';
import { PreferencesModalOptions } from '@adapters/ui/widgets/preferences/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

export default function PreferencesModalCreator(
  options: PreferencesModalOptions
) {
  const { appName, version, preferences } = options;
  return (
    <PreferencesDialog
      appName={appName}
      version={version}
      preferences={preferences}
    />
  );
}

preventZoomKeyEvent();
