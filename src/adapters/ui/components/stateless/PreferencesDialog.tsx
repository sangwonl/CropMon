/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */

import React, { useState, useCallback } from 'react';

import { Preferences } from '@domain/models/preferences';

import PrefsAppearancesTabPanel from '@adapters/ui/components/stateless/PrefsAppearancePanel';
import PrefsGeneralPanel from '@adapters/ui/components/stateless/PrefsGeneralPanel';
import SideTabs, { TabItem } from '@adapters/ui/components/stateless/SideTabs';

import styles from './PreferencesDialog.css';

type Props = {
  origPrefs: Preferences;
  selectedRecordHome: string;
  onChooseRecordHome: () => void;
  onSave: (preferences: Preferences) => void;
  onClose: () => void;
};

const TAB_GENERAL = 'general';
// const TAB_RECORDING = 'recording';
const TAB_APPEARANCES = 'appearances';
const TAB_ITEMS: TabItem[] = [
  { tabId: TAB_GENERAL, title: 'General' },
  // { tabId: TAB_RECORDING, title: 'Recording' },
  { tabId: TAB_APPEARANCES, title: 'Appearances' },
];

const PreferencesDialog = ({
  origPrefs,
  selectedRecordHome,
  onChooseRecordHome,
  onSave,
  onClose,
}: Props) => {
  const [curTabId, setCurTabId] = useState<string>(TAB_GENERAL);

  const handleChooseRecordHome = useCallback(() => {
    onChooseRecordHome();
  }, [onChooseRecordHome]);

  const handleSave = useCallback(
    (prefs: Preferences) => {
      onSave(prefs);
    },
    [onSave]
  );

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

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
                initialPrefs={origPrefs}
                selectedRecordHome={selectedRecordHome}
                onChooseRecordHome={handleChooseRecordHome}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ),
            // [TAB_RECORDING]: (
            //   <PrefsRecordingTabPanel
            //     initialPrefs={origPrefs}
            //     onSave={handleSave}
            //     onCancel={handleCancel}
            //   />
            // ),
            [TAB_APPEARANCES]: (
              <PrefsAppearancesTabPanel
                initialPrefs={origPrefs}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ),
          }[curTabId]
        }
      </div>
    </div>
  );
};

export default PreferencesDialog;
