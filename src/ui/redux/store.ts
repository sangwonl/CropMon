import { configureStore } from '@reduxjs/toolkit';

import createSagaMiddleware from 'redux-saga';
import {
  getInitialStateRenderer,
  triggerAlias,
  forwardToMain,
  forwardToRenderer,
  replayActionMain,
  replayActionRenderer,
} from 'electron-redux';

import { isMain } from '@utils/process';

import uiReducer from './slice';

const reducer = { ui: uiReducer };
const sagaMiddleware = createSagaMiddleware();

const createStore = () => {
  let s;
  if (isMain()) {
    s = configureStore({
      reducer,
      middleware: [triggerAlias, sagaMiddleware, forwardToRenderer],
    });
    replayActionMain(s);
  } else {
    s = configureStore({
      reducer,
      preloadedState: getInitialStateRenderer(),
      middleware: [forwardToMain, sagaMiddleware],
    });
    replayActionRenderer(s);
  }
  return s;
};

const store = createStore();

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export { sagaMiddleware };

export default store;
