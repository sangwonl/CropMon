/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, { FC } from 'react';

import { IScreenBounds } from '@presenters/redux/common/types';

import styles from './CaptureAreaHint.css';

interface PropTypes {
  selectedBounds: IScreenBounds;
}

export const CaptureAreaHint: FC<PropTypes> = (props: PropTypes) => {
  const { selectedBounds: bounds } = props;

  return (
    <div className={styles.wrapper}>
      <div className={styles.hintResolution}>
        {`${bounds.width} x ${bounds.height}`}
      </div>
    </div>
  );
};
