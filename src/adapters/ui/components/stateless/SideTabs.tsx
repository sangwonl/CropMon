import React, { useCallback, useState } from 'react';

import { SideTab } from '@adapters/ui/components/stateless/SideTab';

import styles from './SideTabs.css';

export type TabItem = {
  tabId: string;
  title: string;
};

type Props = {
  defaultTabId?: string;
  tabItems: TabItem[];
  onTabItemSelect: (tabId: string) => void;
};

export function SideTabs({ defaultTabId, tabItems, onTabItemSelect }: Props) {
  const [selectedTabId, setSelectedTabId] = useState(
    () => defaultTabId ?? tabItems[0].tabId,
  );
  const handleTabSelect = useCallback(
    (tabId: string) => {
      setSelectedTabId(tabId);
      onTabItemSelect(tabId);
    },
    [onTabItemSelect],
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
}
