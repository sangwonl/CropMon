/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */

import React from 'react';

import styles from './Tabs.css';

interface TabItemProps {
  tabId: string;
  title: string;
  onSelect: (tabId: string) => void;
}

const Tab = ({ tabId, title, onSelect }: TabItemProps) => {
  return (
    <div
      className={styles.tabItem}
      role="button"
      onClick={() => onSelect(tabId)}
    >
      {title}
    </div>
  );
};

export interface TabItem {
  tabId: string;
  title: string;
}

export interface TabsProps {
  tabItems: TabItem[];
  onTabItemSelect: (tabId: string) => void;
}

const Tabs = ({ tabItems, onTabItemSelect }: TabsProps) => {
  return (
    <div className={styles.container}>
      {tabItems.map(({ tabId, title }) => (
        <Tab
          key={tabId}
          tabId={tabId}
          title={title}
          onSelect={onTabItemSelect}
        />
      ))}
    </div>
  );
};

export default Tabs;
