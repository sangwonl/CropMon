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
}

const getWrapperLayoutStyles = (bounds: SelectedBounds): any => {
  return {
    left: bounds.x,
    top: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
};

export const ControlBox: FC<PropTypes> = (props: PropTypes) => {
  const { active, selectedBounds: bounds } = props;

  const recordBtnClasses = classNames(styles.item, styles.itemRecord);
  const closeBtnClasses = classNames(styles.item, styles.itemClose);

  return active && bounds ? (
    <div className={styles.wrapper} style={getWrapperLayoutStyles(bounds)}>
      <div className={styles.itemBox}>
        <div className={recordBtnClasses}>RECORD</div>
        <div className={closeBtnClasses}>CLOSE</div>
      </div>
    </div>
  ) : null;
};

ControlBox.defaultProps = {
  selectedBounds: undefined,
};
