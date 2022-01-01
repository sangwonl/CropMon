/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { app } from 'electron';
import log from 'electron-log';

import { diContainer } from '@di/containers/main';
import { TYPES } from '@di/types';
import { IActionDispatcher } from '@adapters/actions/types';

import { initializeDevEnv } from './devenv';

const start = async () => {
  await initializeDevEnv();

  await diContainer
    .get<IActionDispatcher>(TYPES.ActionDispatcher)
    .initializeApp();

  app.on('before-quit', () => {
    app.quit();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
};

const instanceLock = app.requestSingleInstanceLock();
if (!instanceLock) {
  app.quit();
} else {
  app.whenReady().then(start).catch(log.error);
}
