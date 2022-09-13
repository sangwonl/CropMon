/* eslint-disable jsx-a11y/click-events-have-key-events */

import classNames from 'classnames';
import React, { useCallback, useState, useEffect } from 'react';

import { withStopPropagation } from '@utils/events';

import styles from './ToggleButton.css';

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
  onToggle: (itemIndex: number) => void;
};

const ToggleButton = ({ activeItemIndex, items, onToggle }: Props) => {
  const [selectedBtnIndex, setSelectedBtnIndex] =
    useState<number>(activeItemIndex);

  const handleItemClick = useCallback(
    (index: number) => {
      onToggle(index);
    },
    [onToggle]
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
            [styles.toggled]: index === selectedBtnIndex,
            [styles.leftRounded]: index === 0,
            [styles.rightRounded]: index === items.length - 1,
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

export default ToggleButton;
