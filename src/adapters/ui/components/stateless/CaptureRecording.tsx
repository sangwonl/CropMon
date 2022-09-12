/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

import { Bounds } from '@domain/models/screen';

import styles from './CaptureRecording.css';

const getAreaStyles = (bounds: Bounds): any => {
  const layoutStyle = {
    left: bounds.x - 2,
    top: bounds.y - 2,
    width: bounds.width + 4,
    height: bounds.height + 4,
  };

  return {
    ...layoutStyle,
    backgroundColor: 'transparent',
    outline: '1px solid rgba(255, 0, 0, 1.0)',
    animation: 'recordingBorder 2s infinite',
  };
};

type Props = {
  targetBounds: Bounds;
};

const CaptureRecording = (props: Props) => {
  const { targetBounds } = props;

  return (
    <div className={styles.wrapper}>
      <div className={styles.area} style={getAreaStyles(targetBounds)} />
    </div>
  );
};

export default CaptureRecording;
