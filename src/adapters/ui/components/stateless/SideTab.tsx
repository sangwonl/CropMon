import classNames from 'classnames';
import React from 'react';

import styles from './SideTab.css';

type Props = {
  tabId: string;
  title: string;
  selected: boolean;
  onSelect: (tabId: string) => void;
};

export function SideTab({ tabId, title, selected, onSelect }: Props) {
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
}
