/* eslint global-require: off, no-console: off */
/* eslint-disable import/prefer-default-export */

import { isDebugMode } from '@utils/process';

const installDevTools = async () => {
  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (isDebugMode()) {
    require('electron-debug')();
  } else {
    return;
  }

  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  // eslint-disable-next-line consistent-return
  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

export const initializeDevEnv = async () => {
  await installDevTools();
};
