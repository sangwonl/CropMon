/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import React, { useEffect, useState } from 'react';

import { ProgressBar } from '@presenters/ui/stateless/components/ProgressBar';

import {
  IpcEventDataSetProgress,
  ProgressDialogButton,
  ProgressDialogLayout,
} from './types';

export interface ProgressDialogProps {
  title: string;
  message: string;
  button: ProgressDialogButton;
  layout?: ProgressDialogLayout;
  progress?: number;
  timeout?: number;
  ipcRenderer?: any;
}

export const ProgressDialog = (props: ProgressDialogProps) => {
  const { title, message } = props;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    props.ipcRenderer?.on(
      'set-progress',
      (_event: any, data: IpcEventDataSetProgress) => {
        setProgress(data.percent);
        if (data.percent >= 100) {
          props.ipcRenderer?.send('progress-done', {});
        }
      }
    );
  }, []);

  return (
    <div>
      <div>{title}</div>
      <div>{message}</div>
      <ProgressBar progress={props.progress || progress} />
      <div>buttons</div>
    </div>
  );
};
