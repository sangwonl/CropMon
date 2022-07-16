/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import React from 'react';

import styles from './ProgressBar.css';

export type ProgressBarProps = {
  progress: number;
};

export const ProgressBar = (props: ProgressBarProps) => {
  const { progress } = props;
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.inner}
        style={{
          width: `${Math.min(progress, 100)}%`,
        }}
      />
    </div>
  );
};
