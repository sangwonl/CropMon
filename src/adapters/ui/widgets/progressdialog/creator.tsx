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

export default function ProgressDialogCreator(options: ProgressDialogOptions) {
  const { message: givenMsg, title, buttons } = options;
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(givenMsg);

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
      title={title}
      message={message}
      buttons={{
        cancelTitle: buttons.cancelTitle,
        actionTitle: buttons.actionTitle,
        actionHideInProgress: buttons.actionHideInProgress,
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

preventZoomKeyEvent();
