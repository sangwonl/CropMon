/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, { FC } from 'react';

import { SelectedBounds } from './types';

import styles from './CaptureAreaHint.css';

interface PropTypes {
  selectedBounds?: SelectedBounds;
}

const getWrapperLayout = (bounds: SelectedBounds): any => {
  return {
    left: bounds.x,
    top: bounds.y,
  };
};

export const CaptureAreaHint: FC<PropTypes> = (props: PropTypes) => {
  const { selectedBounds: bounds } = props;

  return bounds && bounds.width > 100 && bounds.height > 60 ? (
    <div className={styles.wrapper} style={getWrapperLayout(bounds)}>
      <div className={styles.hintResolution}>
        {`${bounds.width} x ${bounds.height}`}
      </div>
    </div>
  ) : null;
};

CaptureAreaHint.defaultProps = {
  selectedBounds: undefined,
};
