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

import { diContainer } from '@di/container';
import { ActionDispatcher } from '@adapters/action';

import { initializeSaga } from './store-main';
import { initializeDevEnv } from './devenv';

const actionDispatcher = diContainer.get(ActionDispatcher);

const start = async () => {
  await initializeDevEnv();

  await initializeSaga();

  await actionDispatcher.initializeApp();

  app.on('will-quit', () => {
    log.info('app will quit... bye!');
  });
};

const instanceLock = app.requestSingleInstanceLock();
if (!instanceLock) {
  app.quit();
} else {
  app.whenReady().then(start).catch(log.error);
}
