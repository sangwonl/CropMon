/* eslint-disable jsx-a11y/click-events-have-key-events */

import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { withStopPropagation } from '@utils/events';

import SelectList from '@adapters/ui/components/stateless/SelectList';
import useOnClickOutside from '@adapters/ui/hooks/hover';

import styles from './TogglableSelect.css';

type ToggleButton = {
  icon: string;
  alt: string;
  active: boolean;
};

type SelectableItem = {
  checked: boolean;
  title: string;
};

type Props = {
  enabled: boolean;
  toggleButton: ToggleButton;
  items: SelectableItem[];
  onToggle: (active: boolean) => void;
  onSelect: (indices: number[]) => void;
};

function TogglableSelect({
  enabled,
  toggleButton,
  items,
  onToggle,
  onSelect,
}: Props) {
  const checkListRef = useRef<HTMLDivElement>(null);
  const [isToggleOn, switchToggle] = useState<boolean>(
    enabled && toggleButton.active
  );
  const [listExpanded, showList] = useState<boolean>(false);

  useEffect(() => {
    switchToggle(enabled && toggleButton.active);
    if (!enabled) {
      showList(false);
    }
  }, [enabled, toggleButton]);

  const handleToggleButtonClick = useCallback(() => {
    if (!listExpanded && !isToggleOn && !items.some((item) => item.checked)) {
      showList(true);
      return;
    }

    if (items.some((item) => item.checked)) {
      switchToggle(!isToggleOn);
      onToggle(!isToggleOn);
    }

    showList(false);
  }, [items, listExpanded, isToggleOn, onToggle]);

  const handleSelectButtonClick = useCallback(() => {
    showList(!listExpanded);
  }, [listExpanded]);

  const handleSelect = useCallback(
    (indices: number[]) => {
      if (indices.length === 0) {
        switchToggle(false);
      }
      onSelect(indices);
    },
    [toggleButton, onSelect]
  );

  useOnClickOutside(checkListRef, () => showList(false));

  return (
    <>
      <div
        className={classNames(styles.container, {
          [styles.disabled]: !enabled,
        })}
      >
        <div
          className={classNames(styles.btn, {
            [styles.selected]: isToggleOn,
          })}
          onClick={(e) =>
            enabled && withStopPropagation(e, () => handleToggleButtonClick())
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
          onClick={(e) =>
            enabled && withStopPropagation(e, () => handleSelectButtonClick())
          }
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
        <div ref={checkListRef} className={styles.selectList}>
          <SelectList
            multiSelect={false}
            items={items}
            onSelect={handleSelect}
          />
        </div>
      )}
    </>
  );
}

export default TogglableSelect;
