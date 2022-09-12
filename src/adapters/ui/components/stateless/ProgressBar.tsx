/* eslint-disable react/display-name */

import React from 'react';

import styles from './ProgressBar.css';

type Props = {
  progress: number;
};

const ProgressBar = (props: Props) => {
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

export default ProgressBar;
