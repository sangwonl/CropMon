/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import classNames from 'classnames';
import React, { useCallback, useRef, useState } from 'react';

import { withStopPropagation } from '@utils/events';

import CheckList from '@adapters/ui/components/stateless/CheckList';
import useOnClickOutside from '@adapters/ui/hooks/hover';

import styles from './TogglableMultiSelect.css';

type ToggleButton = {
  icon: string;
  alt: string;
  enabled: boolean;
};

type SelectableItem = {
  checked: boolean;
  title: string;
};

type Props = {
  toggleButton: ToggleButton;
  items: SelectableItem[];
  onToggle: (enabled: boolean) => void;
  onSelect: (indices: number[]) => void;
};

const TogglableMultiSelect = ({
  toggleButton,
  items,
  onToggle,
  onSelect,
}: Props) => {
  const checkListRef = useRef<HTMLDivElement>(null);
  const [toggleEnabled, changeToggle] = useState<boolean>(toggleButton.enabled);
  const [listExpanded, showList] = useState<boolean>(false);

  const handleToggleButtonClick = useCallback(() => {
    changeToggle(!toggleEnabled);
    onToggle(!toggleEnabled);
  }, [toggleEnabled, onToggle]);

  const handleSelectButtonClick = useCallback(() => {
    showList(!listExpanded);
  }, [listExpanded]);

  const handleSelect = useCallback(
    (indices: number[]) => {
      if (indices.length > 0) {
        changeToggle(toggleButton.enabled);
      } else {
        changeToggle(false);
      }
      onSelect(indices);
    },
    [toggleButton.enabled, onSelect]
  );

  useOnClickOutside(checkListRef, () => showList(false));

  return (
    <>
      <div className={styles.container}>
        <div
          className={classNames(styles.btn, {
            [styles.selected]: toggleEnabled,
          })}
          onClick={(e) =>
            withStopPropagation(e, () => handleToggleButtonClick())
          }
          onMouseUp={withStopPropagation}
          onMouseDown={withStopPropagation}
        >
          <img
            className={styles.btnIcon}
            src={toggleButton.icon}
            alt={toggleButton.alt}
          />
        </div>
        <div
          className={classNames(styles.arrowBtn, {
            [styles.selected]: listExpanded,
          })}
          onClick={handleSelectButtonClick}
          onMouseUp={withStopPropagation}
          onMouseDown={withStopPropagation}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M7 10l5 5 5-5z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </div>
      </div>
      {listExpanded && (
        <div ref={checkListRef} className={styles.checkList}>
          <CheckList items={items} onSelect={handleSelect} />
        </div>
      )}
    </>
  );
};

export default TogglableMultiSelect;
