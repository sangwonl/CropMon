/* eslint-disable @typescript-eslint/no-explicit-any */

import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

import ProgressDialog from '@adapters/ui/components/stateless/ProgressDialog';
import {
  ProgressDialogOptions,
  IpcEvtSetProgress,
  IPC_EVT_SET_PROGRESS,
  IPC_EVT_ON_ACTION,
  IPC_EVT_ON_CANCEL,
  IPC_EVT_SET_MESSAGE,
  IpcEvtSetMessage,
} from '@adapters/ui/widgets/progressdialog/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

type PropTypes = {
  options: ProgressDialogOptions;
};

function Wrapper(props: PropTypes) {
  const { options } = props;
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(options.message);

  useEffect(() => {
    ipcRenderer.on(
      IPC_EVT_SET_PROGRESS,
      (_event: any, data: IpcEvtSetProgress) => setProgress(data.progress)
    );

    ipcRenderer.on(IPC_EVT_SET_MESSAGE, (_event: any, data: IpcEvtSetMessage) =>
      setMessage(data.message)
    );
  }, []);

  return (
    <ProgressDialog
      title={options.title}
      message={message}
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
}

export default function (options: ProgressDialogOptions) {
  return <Wrapper options={options} />;
}

preventZoomKeyEvent();
