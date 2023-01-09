/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */

import classNames from 'classnames';
import React from 'react';

import styles from './SideTab.css';

type Props = {
  tabId: string;
  title: string;
  selected: boolean;
  onSelect: (tabId: string) => void;
};

function SideTab({ tabId, title, selected, onSelect }: Props) {
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

export default SideTab;
