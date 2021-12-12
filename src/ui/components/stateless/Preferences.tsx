/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/prefer-default-export */

import React, { useState, useCallback } from 'react';

import { IPreferences } from '@core/entities/preferences';

import {
  PrefsGeneralTabPanel,
  PrefsAppearancesTabPanel,
} from './PrefsTabPanels';
import SideTabs, { TabItem } from './SideTabs';
import styles from './Preferences.css';

export interface PreferencesProps {
  origPrefs: IPreferences;
  selectedRecordHome: string;
  onChooseRecordHome: () => void;
  onClose: (preferences?: IPreferences) => void;
}

const TAB_GENERAL = 'general';
// const TAB_RECORDING = 'recording';
const TAB_APPEARANCES = 'appearances';
const TAB_ITEMS: TabItem[] = [
  { tabId: TAB_GENERAL, title: 'General' },
  // { tabId: TAB_RECORDING, title: 'Recording' },
  { tabId: TAB_APPEARANCES, title: 'Appearances' },
];

export const Preferences = ({
  origPrefs,
  selectedRecordHome,
  onChooseRecordHome,
  onClose,
}: PreferencesProps) => {
  const [curTabId, setCurTabId] = useState<string>(TAB_GENERAL);

  const handleChooseRecordHome = useCallback(() => {
    onChooseRecordHome();
  }, [onChooseRecordHome]);

  const handleSave = useCallback(
    (prefs: IPreferences) => {
      onClose(prefs);
    },
    [onClose]
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
