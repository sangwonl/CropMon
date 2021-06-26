/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/display-name */

import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

import { ProgressDialog } from '@ui/components/stateless/ProgressDialog';
import { getCurWidgetCustomData } from '@utils/remote';

import {
  ProgressDialogOptions,
  IpcEvtSetProgress,
  IPC_EVT_SET_PROGRESS,
  IPC_EVT_ON_ACTION,
  IPC_EVT_ON_CANCEL,
} from './shared';

const options = getCurWidgetCustomData<ProgressDialogOptions>('options');

const Wrapper = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    ipcRenderer.on(
      IPC_EVT_SET_PROGRESS,
      (_event: any, data: IpcEvtSetProgress) => setProgress(data.progress)
    );
  }, []);

  return (
    <ProgressDialog
      title={options.title}
      message={options.message}
      buttons={{
        cancelTitle: options.buttons.cancelTitle,
        actionTitle: options.buttons.actionTitle,
        actionHideInProgress: options.buttons.actionHideInProgress,
      }}
      progress={progress}
      onActionClick={() => {
        ipcRenderer.send(IPC_EVT_ON_ACTION, {});
      }}
      onCancelClick={() => {
        ipcRenderer.send(IPC_EVT_ON_CANCEL, {});
      }}
    />
  );
};

export default () => {
  return <Wrapper />;
};
