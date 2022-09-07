/* eslint-disable react/button-has-type */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import React from 'react';

import { ProgressBar } from '@adapters/ui/components/stateless/ProgressBar';

import styles from './ProgressDialog.css';

export type ProgressDialogButtonsProps = {
  cancelTitle: string;
  actionTitle?: string;
  actionHideInProgress?: boolean;
};

export type ProgressDialogProps = {
  title: string;
  message: string;
  buttons: ProgressDialogButtonsProps;
  progress: number;
  onCancelClick: () => void;
  onActionClick: () => void;
};

export const ProgressDialog = (props: ProgressDialogProps) => {
  const { title, message, buttons, progress } = props;
  const { cancelTitle, actionTitle, actionHideInProgress = true } = buttons;

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
      </div>
      <div className={styles.progress}>
        <ProgressBar progress={progress} />
      </div>
      <div className={styles.buttons}>
        {actionTitle && (!actionHideInProgress || progress >= 100) && (
          <button className={styles.buttonAction} onClick={props.onActionClick}>
            {actionTitle}
          </button>
        )}
        <button className={styles.buttonCancel} onClick={props.onCancelClick}>
          {cancelTitle}
        </button>
      </div>
    </div>
  );
};
