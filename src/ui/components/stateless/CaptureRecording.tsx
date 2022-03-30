/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { FC } from 'react';

import { IBounds } from '@core/entities/screen';

import styles from '@ui/components/stateless/CaptureRecording.css';

const getAreaStyles = (bounds: IBounds): any => {
  const layoutStyle = {
    left: bounds.x - 1,
    top: bounds.y - 1,
    width: bounds.width + 2,
    height: bounds.height + 2,
  };

  return {
    ...layoutStyle,
    backgroundColor: 'transparent',
    outline: '1px solid rgba(255, 0, 0, 1.0)',
    animation: 'recordingBorder 2s infinite',
  };
};

interface PropTypes {
  selectedBounds: IBounds;
}

const CaptureRecording: FC<PropTypes> = (props: PropTypes) => {
  const { selectedBounds } = props;

  return (
    <div className={styles.wrapper}>
      <div className={styles.area} style={getAreaStyles(selectedBounds)} />
    </div>
  );
};

export default CaptureRecording;
