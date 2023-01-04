/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */

import React, { useCallback, useState } from 'react';

import SideTab from '@adapters/ui/components/stateless/SideTab';

import styles from './SideTabs.css';

export type TabItem = {
  tabId: string;
  title: string;
};

type Props = {
  // eslint-disable-next-line react/require-default-props
  defaultTabId?: string;
  tabItems: TabItem[];
  onTabItemSelect: (tabId: string) => void;
};

const SideTabs = ({ defaultTabId, tabItems, onTabItemSelect }: Props) => {
  const [selectedTabId, setSelectedTabId] = useState(
    () => defaultTabId ?? tabItems[0].tabId
  );
  const handleTabSelect = useCallback(
    (tabId: string) => {
      setSelectedTabId(tabId);
      onTabItemSelect(tabId);
    },
    [onTabItemSelect]
  );

  return (
    <div className={styles.container}>
      {tabItems.map(({ tabId, title }) => (
        <SideTab
          key={tabId}
          tabId={tabId}
          title={title}
          selected={tabId === selectedTabId}
          onSelect={handleTabSelect}
        />
      ))}
    </div>
  );
};

export default SideTabs;
