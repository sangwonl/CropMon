/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/display-name */

import { ipcRenderer } from 'electron';
import React from 'react';

import { getCurWindowCustomData } from '@utils/remote';

import { ProgressDialog } from './ProgressDialog';
import { ProgressDialogOptions } from './types';

export default () => {
  const props = getCurWindowCustomData<ProgressDialogOptions>('props');
  return <ProgressDialog {...props} ipcRenderer={ipcRenderer} />;
};
