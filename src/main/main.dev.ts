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

import { TYPES } from '@di/types';
import { diContainer } from '@di/container';
import { IHookManager } from '@core/interfaces/hook';
import { IUiDirector } from '@core/interfaces/director';
import { BuiltinHooks } from '@infrastructures/hook';

import { initializeSaga } from './store-main';
import { initializeDevEnv } from './devenv';

const uiDirector = diContainer.get<IUiDirector>(TYPES.UiDirector);
const hookManager = diContainer.get<IHookManager>(TYPES.HookManager);

diContainer.get(BuiltinHooks);

const initializeApp = async () => {
  uiDirector.initialize();

  app.on('will-quit', () => {
    log.info('app will quit... bye!');
  });
};

const start = async () => {
  await initializeDevEnv();

  initializeSaga();

  await initializeApp();

  hookManager.emit('app-launched', {});
};

const instanceLock = app.requestSingleInstanceLock();
if (!instanceLock) {
  app.quit();
} else {
  app.whenReady().then(start).catch(log.error);
}
