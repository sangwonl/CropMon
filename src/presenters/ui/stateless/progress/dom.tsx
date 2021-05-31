/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

import { getCurWindowCustomData } from '@utils/remote';

import { IpcEventDataSetProgress, ProgressDialogOptions } from './types';

const options = getCurWindowCustomData<ProgressDialogOptions>('options');

export default () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    ipcRenderer.on('set-progress', (_event, data: IpcEventDataSetProgress) => {
      setProgress(data.percent);
      if (data.percent >= 100) {
        ipcRenderer.send('progress-done', {});
      }
    });
  }, []);

  return <div>{progress}</div>;
};
