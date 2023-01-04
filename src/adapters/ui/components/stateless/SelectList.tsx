/* eslint-disable jsx-a11y/label-has-associated-control */

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

const SelectList = ({ multiSelect, items, onSelect }: Props) => {
  const checkStatesRef = useRef<boolean[]>(items.map(({ checked }) => checked));
  const [checkStates, updateCheckStates] = useState<boolean[]>(
    checkStatesRef.current
  );

  const toggleCheck = useCallback(
    (index: number) => {
      const orig = checkStatesRef.current[index];

      if (!multiSelect) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < checkStatesRef.current.length; i++) {
          checkStatesRef.current[i] = false;
        }
      }

      checkStatesRef.current[index] = !orig;
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
          {multiSelect ? (
            <>
              <input
                type="checkbox"
                id={title}
                className={styles.checkInput}
                onChange={() => toggleCheck(index)}
                checked={checkStates[index]}
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
                onChange={() => toggleCheck(index)}
                checked={checkStates[index]}
              />
              <label htmlFor={title}>
                <span className={styles.title}>{title}</span>
              </label>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default SelectList;
