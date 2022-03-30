/* eslint global-require: off, no-console: off */
/* eslint-disable consistent-return */

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

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const initializeDevEnv = async () => {
  await installDevTools();
};

export default initializeDevEnv;
