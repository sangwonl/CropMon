/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import React, { useEffect, useState } from 'react';

import styles from './ProgressBar.css';

export interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = (props: ProgressBarProps) => {
  const { progress } = props;
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.inner}
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
};
