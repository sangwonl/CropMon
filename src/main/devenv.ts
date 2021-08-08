/* eslint global-require: off, no-console: off */
/* eslint-disable import/prefer-default-export */

import { isDebugMode, isProduction } from '@utils/process';

const installDevTools = async () => {
  if (isProduction()) {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (isDebugMode()) {
    require('electron-debug')({ showDevTools: false });
  } else {
    return;
  }

  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

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
