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
import { IAnalyticsTracker } from '@core/components/tracker';
import { UiDirector } from '@presenters/interactor/director';
import store, { initializeSaga } from '@presenters/redux/store-main';
import { loadPreferences } from '@presenters/redux/ui/slice';
import { getPlatform } from '@utils/process';

import { assetResolver } from '../common/asset';
import { AppUpdater } from './updater';
import { initializeDevEnv } from './devenv';
import { configureShortcuts } from './shortcut';

const uiDirector = diContainer.get(UiDirector);
const tracker = diContainer.get<IAnalyticsTracker>(TYPES.AnalyticsTracker);

const initializeApp = () => {
  new AppUpdater().checkForUpdates();

  configureShortcuts();

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

  tracker.eventL('app-lifecycle', 'launch', getPlatform());

  tracker.view('idle');
};

app.whenReady().then(start).catch(console.log);
