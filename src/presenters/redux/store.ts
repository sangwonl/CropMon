import { applyMiddleware } from 'redux';
import { configureStore } from '@reduxjs/toolkit';

import { composeWithStateSync } from 'electron-redux';
import createSagaMiddleware from 'redux-saga';

import captureReducer from './capture/slice';

const sagaMiddleware = createSagaMiddleware();
const middlewares = applyMiddleware(sagaMiddleware);
const composedEnhancer = composeWithStateSync(...[middlewares]);

const store = configureStore({
  reducer: {
    capture: captureReducer,
  },
  enhancers: [composedEnhancer],
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export { sagaMiddleware };

export default store;
