/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, { FC } from 'react';
import classNames from 'classnames';

import { SelectedBounds } from './types';
import styles from './ControlBox.css';

interface PropTypes {
  active: boolean;
  selectedBounds?: SelectedBounds;
  onRecordStart: () => void;
  onClose: () => void;
}

const getWrapperLayout = (bounds: SelectedBounds): any => {
  return {
    left: bounds.x,
    top: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
};

export const ControlBox: FC<PropTypes> = (props: PropTypes) => {
  const { active, selectedBounds: bounds, onRecordStart, onClose } = props;

  const recordBtnClasses = classNames(styles.item, styles.itemRecord);
  const closeBtnClasses = classNames(styles.item, styles.itemClose);

  return active && bounds ? (
    <div className={styles.wrapper} style={getWrapperLayout(bounds)}>
      <div className={styles.itemBox}>
        <div className={recordBtnClasses} onClick={onRecordStart}>
          RECORD
        </div>
        <div className={closeBtnClasses} onClick={onClose}>
          CLOSE
        </div>
      </div>
    </div>
  ) : null;
};

ControlBox.defaultProps = {
  selectedBounds: undefined,
};
