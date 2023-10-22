import React, { useState } from 'react';

import type { Preferences } from '@domain/models/preferences';

import { PrefsAboutPanel } from '@adapters/ui/components/stateless/PrefsAboutPanel';
import { PrefsAppearancesPanel } from '@adapters/ui/components/stateless/PrefsAppearancePanel';
import { PrefsGeneralPanel } from '@adapters/ui/components/stateless/PrefsGeneralPanel';
import {
  type TabItem,
  SideTabs,
} from '@adapters/ui/components/stateless/SideTabs';

import styles from './PrefsPanels.css';

type Props = {
  appName: string;
  version: string;
  prefs: Preferences;
  recordHome: string;
  onChooseRecordHome: () => void;
  onSave: (preferences: Preferences) => void;
  onClose: () => void;
};

const TAB_GENERAL = 'general';
const TAB_APPEARANCES = 'appearances';
const TAB_ABOUT = 'about';
const TAB_ITEMS: TabItem[] = [
  { tabId: TAB_GENERAL, title: 'General' },
  { tabId: TAB_APPEARANCES, title: 'Appearances' },
  { tabId: TAB_ABOUT, title: 'About' },
];

export function PrefsPanels({
  appName,
  version,
  prefs,
  recordHome,
  onChooseRecordHome,
  onSave,
  onClose,
}: Props) {
  const [curTabId, setCurTabId] = useState<string>(TAB_GENERAL);

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <SideTabs
          defaultTabId={curTabId}
          tabItems={TAB_ITEMS}
          onTabItemSelect={setCurTabId}
        />
      </div>
      <div className={styles.tabPanel}>
        {
          {
            [TAB_GENERAL]: (
              <PrefsGeneralPanel
                prefs={prefs}
                recordHome={recordHome}
                onChooseRecordHome={onChooseRecordHome}
                onSave={onSave}
                onCancel={onClose}
              />
            ),
            [TAB_APPEARANCES]: (
              <PrefsAppearancesPanel
                prefs={prefs}
                onSave={onSave}
                onCancel={onClose}
              />
            ),
            [TAB_ABOUT]: (
              <PrefsAboutPanel
                appName={appName}
                version={version}
                prefs={prefs}
              />
            ),
          }[curTabId]
        }
      </div>
    </div>
  );
}
