import React from 'react';

import type { Bounds } from '@domain/models/screen';

import styles from './CaptureRecording.css';

const getAreaStyles = (bounds: Bounds): { [key: string]: number | string } => {
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

export function CaptureRecording(props: Props) {
  const { targetBounds } = props;

  return (
    <div className={styles.wrapper}>
      <div className={styles.area} style={getAreaStyles(targetBounds)} />
    </div>
  );
}
