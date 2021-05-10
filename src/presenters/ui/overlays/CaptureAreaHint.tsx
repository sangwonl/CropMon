/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, { FC } from 'react';

import { IBounds } from '@core/entities/screen';

import styles from './CaptureAreaHint.css';

interface PropTypes {
  selectedBounds: IBounds;
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
