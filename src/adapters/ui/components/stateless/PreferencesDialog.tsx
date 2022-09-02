/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/prefer-default-export */

import React, { useState, useCallback } from 'react';

import { Preferences } from '@domain/models/preferences';

import {
  PrefsGeneralTabPanel,
  PrefsAppearancesTabPanel,
} from '@adapters/ui/components/stateless/PrefsTabPanels';
import SideTabs, { TabItem } from '@adapters/ui/components/stateless/SideTabs';

import styles from './PreferencesDialog.css';

export type AppPreferencesProps = {
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

export const PreferencesDialog = ({
  origPrefs,
  selectedRecordHome,
  onChooseRecordHome,
  onSave,
  onClose,
}: AppPreferencesProps) => {
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
              <PrefsGeneralTabPanel
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
