/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/display-name */

import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

import { ProgressDialog } from '@presenters/ui/components/stateless/ProgressDialog';
import { getCurWidgetCustomData } from '@utils/remote';

import {
  ProgressDialogOptions,
  IpcEventSetProgress,
  IPC_EVENT_SET_PROGRESS,
  IPC_EVENT_ON_ACTION_BTN_CLICK,
  IPC_EVENT_ON_CANCEL_BTN_CLICK,
} from './shared';

const options = getCurWidgetCustomData<ProgressDialogOptions>('options');

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
      buttons={{
        cancelTitle: options.buttons.cancelTitle,
        actionTitle: options.buttons.actionTitle,
        actionHideInProgress: options.buttons.actionHideInProgress,
      }}
      progress={progress}
      onActionClick={() => {
        ipcRenderer.send(IPC_EVENT_ON_ACTION_BTN_CLICK, {});
      }}
      onCancelClick={() => {
        ipcRenderer.send(IPC_EVENT_ON_CANCEL_BTN_CLICK, {});
      }}
    />
  );
};

export default () => {
  return <Wrapper />;
};
