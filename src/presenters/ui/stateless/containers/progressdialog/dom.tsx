/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import { getCurWindowCustomData } from '@utils/remote';
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

import { ProgressBar } from '@presenters/ui/stateless/components/progressbar';
import {
  IpcEventDataSetProgress,
  ProgressDialogButton,
  ProgressDialogLayout,
  ProgressDialogOptions,
} from './types';

export interface ProgressDialogProps {
  title: string;
  message: string;
  button: ProgressDialogButton;
  timeout?: number;
  layout?: ProgressDialogLayout;
}

export const ProgressDialog = (props: ProgressDialogProps) => {
  const { title, message } = props;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    ipcRenderer.on('set-progress', (_event, data: IpcEventDataSetProgress) => {
      setProgress(data.percent);
      if (data.percent >= 100) {
        ipcRenderer.send('progress-done', {});
      }
    });
  }, []);

  return (
    <div>
      <div>{title}</div>
      <div>{message}</div>
      <ProgressBar progress={progress} />
      <div>buttons</div>
    </div>
  );
};

export default () => {
  const props = getCurWindowCustomData<ProgressDialogOptions>('props');
  return <ProgressDialog {...props} />;
};
