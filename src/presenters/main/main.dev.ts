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

import { TYPES } from '@di/types';
import { diContainer } from '@di/container';
import { UiDirector } from '@presenters/interactor/director';
import { loadPreferences } from '@presenters/redux/ui/slice';
import store, { initializeSaga } from '@presenters/redux/store-main';

import { assetResolver } from '../common/asset';
import { AppUpdater } from './updater';
import { initializeDevEnv } from './devenv';
import { configureShortcuts } from './shortcut';

const uiDirector = diContainer.get<UiDirector>(TYPES.UiDirector);

const initializeApp = () => {
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  configureShortcuts();

  // app.on('window-all-closed', () => {
  //   // Respect the OSX convention of having the application in memory even
  //   // after all windows have been closed
  //   if (process.platform !== 'darwin') {
  //     app.quit();
  //   }
  // });

  // app.on('activate', () => {
  //   createMainWindow();
  // });

  store.dispatch(loadPreferences());
};

const initializeWindows = () => {
  uiDirector.intialize(assetResolver);
};

const start = async () => {
  await initializeDevEnv();

  initializeSaga();

  initializeApp();

  initializeWindows();
};

app.whenReady().then(start).catch(console.log);
