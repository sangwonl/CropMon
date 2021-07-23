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
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { IUiDirector } from '@core/interfaces/director';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { BuiltinHooks } from '@infrastructures/hook';
import { checkForUpdates } from '@ui/redux/slice';
import { getPlatform } from '@utils/process';

import store, { initializeSaga } from './store-main';
import { initializeDevEnv } from './devenv';

const uiDirector = diContainer.get<IUiDirector>(TYPES.UiDirector);
const tracker = diContainer.get<IAnalyticsTracker>(TYPES.AnalyticsTracker);
const prefsUseCase = diContainer.get(PreferencesUseCase);
const builtinHooks = diContainer.get(BuiltinHooks);

const initializeApp = async () => {
  store.dispatch(checkForUpdates());

  uiDirector.initialize();

  uiDirector.refreshTrayState(await prefsUseCase.fetchUserPreferences(), false);

  app.on('will-quit', () => {});
};

const start = async () => {
  await initializeDevEnv();

  initializeSaga();

  await initializeApp();

  tracker.eventL('app-lifecycle', 'launch', getPlatform());
  tracker.view('idle');
};

const instanceLock = app.requestSingleInstanceLock();
if (!instanceLock) {
  app.quit();
} else {
  app.whenReady().then(start).catch(log.error);
}
