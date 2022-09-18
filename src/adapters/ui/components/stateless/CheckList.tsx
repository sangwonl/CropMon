/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useCallback, useRef, useState } from 'react';

import styles from './CheckList.css';

type SelectableItem = {
  checked: boolean;
  title: string;
};

type Props = {
  items: SelectableItem[];
  onSelect: (indices: number[]) => void;
};

const CheckList = ({ items, onSelect }: Props) => {
  const checkStatesRef = useRef<boolean[]>(items.map(({ checked }) => checked));
  const [checkStates, updateCheckStates] = useState<boolean[]>(
    checkStatesRef.current
  );

  const toggleCheck = useCallback(
    (index: number) => {
      const orig = checkStatesRef.current[index];
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
    [onSelect]
  );

  return (
    <div className={styles.container}>
      {items.map(({ title }, index) => (
        <div key={title}>
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
        </div>
      ))}
    </div>
  );
};

export default CheckList;
