/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import React, { useEffect } from 'react';

import { ProgressBar } from '@presenters/ui/stateless/components/ProgressBar';

import styles from './ProgressDialog.css';

export interface ProgressDialogButtonProps {
  title: string;
  enabled: boolean;
  enableOnCompletion: boolean;
}

export interface ProgressDialogProps {
  title: string;
  message: string;
  button: ProgressDialogButtonProps;
  progress: number;
  onButtonClick: () => void;
}

export const ProgressDialog = (props: ProgressDialogProps) => {
  const { title, message, progress } = props;

  // useEffect(() => {
  // }, [progress]);

  return (
    <div>
      <div className={styles.title}>{title}</div>
      <div className={styles.message}>{message}</div>
      <ProgressBar progress={progress} />
      <div>buttons</div>
    </div>
  );
};
