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
import { IAnalyticsTracker } from '@core/components/tracker';
import { UiDirector } from '@presenters/interactor/director';
import store, { initializeSaga } from '@presenters/redux/store-main';
import { checkForUpdates, loadPreferences } from '@presenters/redux/ui/slice';
import { getPlatform } from '@utils/process';

import { initializeDevEnv } from './devenv';
import { initializeShortcuts } from './shortcut';

const uiDirector = diContainer.get(UiDirector);
const tracker = diContainer.get<IAnalyticsTracker>(TYPES.AnalyticsTracker);

const initializeApp = async () => {
  initializeShortcuts();

  store.dispatch(checkForUpdates());

  store.dispatch(loadPreferences());

  app.on('quit', () => {
    uiDirector.quitApplication();
  });
};

const initializeWindows = () => {
  uiDirector.intialize();
};

const start = async () => {
  await initializeDevEnv();

  initializeSaga();

  await initializeApp();

  initializeWindows();

  tracker.eventL('app-lifecycle', 'launch', getPlatform());

  tracker.view('idle');
};

app.whenReady().then(start).catch(log.error);
