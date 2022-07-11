/* eslint global-require: off, no-console: off */
/* eslint-disable consistent-return */

import { isDebugMode, isProduction } from '@utils/process';

const installDevTools = async () => {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();

  const installElectronDebug = require('electron-debug');
  installElectronDebug({ showDevTools: false });

  const installExtensions = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  installExtensions
    .default(
      extensions.map((name) => installExtensions[name]),
      forceDownload
    )
    .catch(console.log);
};

const initializeDevEnv = () => {
  if (!isProduction() && isDebugMode()) {
    installDevTools();
  }
};

export default initializeDevEnv;
