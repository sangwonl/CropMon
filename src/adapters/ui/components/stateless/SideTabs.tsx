/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */

import React, { useCallback, useState } from 'react';
import classNames from 'classnames';

import styles from './SideTabs.css';

interface TabItemProps {
  tabId: string;
  title: string;
  selected: boolean;
  onSelect: (tabId: string) => void;
}

const Tab = ({ tabId, title, selected, onSelect }: TabItemProps) => {
  return (
    <div
      className={classNames(styles.tabItem, {
        [styles.tabItemSelected]: selected,
      })}
      role="button"
      onClick={() => onSelect(tabId)}
    >
      {title}
    </div>
  );
};

export type TabItem = {
  tabId: string;
  title: string;
};

export type SideTabsProps = {
  // eslint-disable-next-line react/require-default-props
  defaultTabId?: string;
  tabItems: TabItem[];
  onTabItemSelect: (tabId: string) => void;
};

const SideTabs = ({
  defaultTabId,
  tabItems,
  onTabItemSelect,
}: SideTabsProps) => {
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
        <Tab
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
