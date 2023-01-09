/* eslint-disable no-plusplus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */

import classNames from 'classnames';
import React, { useCallback, useRef, useState } from 'react';

import { withStopPropagation } from '@utils/events';

import styles from './SelectList.css';

type SelectableItem = {
  checked: boolean;
  title: string;
};

type Props = {
  multiSelect: boolean;
  items: SelectableItem[];
  onSelect: (indices: number[]) => void;
};

function SelectList({ multiSelect, items, onSelect }: Props) {
  const checkStatesRef = useRef<boolean[]>(items.map(({ checked }) => checked));
  const [checkStates, updateCheckStates] = useState<boolean[]>(
    checkStatesRef.current
  );

  const toggleCheck = useCallback(
    (index: number) => {
      const orig = checkStatesRef.current[index];

      if (multiSelect) {
        checkStatesRef.current[index] = !orig;
      } else {
        for (let i = 0; i < checkStatesRef.current.length; i++) {
          checkStatesRef.current[i] = false;
        }
        checkStatesRef.current[index] = true;
      }

      updateCheckStates([...checkStatesRef.current]);

      const indices: number[] = [];
      checkStatesRef.current.forEach((checked, i) => {
        if (checked) {
          indices.push(i);
        }
      });
      onSelect(indices);
    },
    [onSelect, multiSelect]
  );

  return (
    <div className={styles.container}>
      {items.map(({ title }, index) => (
        <div
          key={title}
          onMouseUp={withStopPropagation}
          onMouseDown={withStopPropagation}
        >
          <div className={styles.item} onMouseUp={() => toggleCheck(index)}>
            {multiSelect ? (
              <>
                <input
                  type="checkbox"
                  id={title}
                  className={classNames(styles.checkInput, styles.item)}
                  checked={checkStates[index]}
                  onChange={() => {}}
                />
                <label htmlFor={title}>
                  <span className={styles.title}>{title}</span>
                </label>
              </>
            ) : (
              <>
                <input
                  type="radio"
                  id={title}
                  name={title}
                  className={styles.radioInput}
                  checked={checkStates[index]}
                  onChange={() => {}}
                />
                <label htmlFor={title}>
                  <span className={styles.title}>{title}</span>
                </label>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SelectList;
