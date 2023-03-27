import React, { useState } from 'react';

import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';

import PrefsAboutPanel from '@adapters/ui/components/stateless/PrefsAboutPanel';
import PrefsAppearancesTabPanel from '@adapters/ui/components/stateless/PrefsAppearancePanel';
import PrefsGeneralPanel from '@adapters/ui/components/stateless/PrefsGeneralPanel';
import SideTabs, { TabItem } from '@adapters/ui/components/stateless/SideTabs';

import styles from './PrefsPanels.css';

type Props = {
  version: string;
  prefs: Preferences;
  license: License | null;
  recordHome: string;
  registerError: string | null;
  onChooseRecordHome: () => void;
  onRegister: (email: string, licenseKey: string) => void;
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

function PrefsPanels({
  version,
  prefs,
  license,
  recordHome,
  registerError,
  onChooseRecordHome,
  onRegister,
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
              <PrefsAppearancesTabPanel
                prefs={prefs}
                onSave={onSave}
                onCancel={onClose}
              />
            ),
            [TAB_ABOUT]: (
              <PrefsAboutPanel
                version={version}
                prefs={prefs}
                license={license}
                registerError={registerError}
                onRegister={onRegister}
              />
            ),
          }[curTabId]
        }
      </div>
    </div>
  );
}

export default PrefsPanels;
