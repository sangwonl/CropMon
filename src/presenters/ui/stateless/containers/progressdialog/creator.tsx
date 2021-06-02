/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/display-name */

import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

import { getCurWindowCustomData } from '@utils/remote';

import { ProgressDialog } from '../../components/ProgressDialog';
import {
  ProgressDialogOptions,
  IPC_EVENT_ON_BUTTON_CLICK,
  IPC_EVENT_SET_PROGRESS,
  IpcEventSetProgress,
} from './shared';

const options = getCurWindowCustomData<ProgressDialogOptions>('options');

const Wrapper = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    ipcRenderer.on(
      IPC_EVENT_SET_PROGRESS,
      (_event: any, data: IpcEventSetProgress) => setProgress(data.progress)
    );
  }, []);

  return (
    <ProgressDialog
      title={options.title}
      message={options.message}
      button={{
        title: options.button.title,
        enabled: options.button.enabled,
        enableOnCompletion: options.button.enableOnCompletion,
      }}
      progress={progress}
      onButtonClick={() => {
        ipcRenderer.send(IPC_EVENT_ON_BUTTON_CLICK, {});
      }}
    />
  );
};

export default () => {
  return <Wrapper />;
};
