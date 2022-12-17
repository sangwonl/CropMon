/* eslint-disable jsx-a11y/click-events-have-key-events */

import classNames from 'classnames';
import React, { useCallback, useState, useEffect } from 'react';

import { withStopPropagation } from '@utils/events';

import styles from './SwitchButton.css';

type ButtonItem =
  | {
      title: string;
      icon?: never;
      alt?: string;
    }
  | {
      title?: never;
      icon: string;
      alt?: string;
    };

type Props = {
  activeItemIndex: number;
  items: ButtonItem[];
  onSelect: (itemIndex: number) => void;
};

const SwitchButton = ({ activeItemIndex, items, onSelect }: Props) => {
  const [selectedBtnIndex, setSelectedBtnIndex] =
    useState<number>(activeItemIndex);

  const handleItemClick = useCallback(
    (index: number) => {
      onSelect(index);
    },
    [onSelect]
  );

  useEffect(() => {
    setSelectedBtnIndex(activeItemIndex);
  }, [activeItemIndex]);

  return (
    <div className={styles.container}>
      {items.map((item, index) => (
        <div
          key={item.title ?? item.icon}
          className={classNames(styles.btn, {
            [styles.selected]: index === selectedBtnIndex,
          })}
          onClick={(e) => withStopPropagation(e, () => handleItemClick(index))}
          onMouseUp={withStopPropagation}
          onMouseDown={withStopPropagation}
        >
          {item.icon && (
            <img className={styles.btnIcon} src={item.icon} alt={item.alt} />
          )}
          {item.title && (
            <span className={styles.btnTitle} title={item.alt}>
              {item.title}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SwitchButton;
