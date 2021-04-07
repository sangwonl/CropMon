import { applyMiddleware } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { composeWithStateSync } from 'electron-redux';
import createSagaMiddleware from 'redux-saga';

import captureReducer from './capture/slice';
import captureSaga from './capture/saga';

const sagaMiddleware = createSagaMiddleware();

const middlewares = applyMiddleware(sagaMiddleware);
const composedEnhancer = composeWithStateSync(...[middlewares]);

const store = configureStore({
  reducer: {
    capture: captureReducer,
  },
  enhancers: [composedEnhancer],
});

export const initializeSaga = () => {
  // eslint-disable-next-line no-console
  console.log(store.getState());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (store as any).saga = sagaMiddleware.run(captureSaga);
};

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
