import React from 'react';

import { PreferencesDialog } from '@adapters/ui/components/stateful/PreferencesDialog';
import type { PreferencesDialogOptions } from '@adapters/ui/widgets/preferences/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

export function PreferencesDialogCreator(options: PreferencesDialogOptions) {
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
