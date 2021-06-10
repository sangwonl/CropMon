/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, { FC, MouseEvent } from 'react';
import classNames from 'classnames';

import styles from './ControlBox.css';

interface PropTypes {
  onRecord: () => void;
  onClose: () => void;
}

export const ControlBox: FC<PropTypes> = (props: PropTypes) => {
  const { onRecord, onClose } = props;

  const recordBtnClasses = classNames(styles.item, styles.itemRecord);
  const closeBtnClasses = classNames(styles.item, styles.itemClose);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.itemBox}
        onMouseDown={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        onMouseUp={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <button type="button" className={recordBtnClasses} onClick={onRecord}>
          RECORD
        </button>
        <button type="button" className={closeBtnClasses} onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
};
