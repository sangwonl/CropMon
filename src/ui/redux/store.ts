import { applyMiddleware } from 'redux';
import { configureStore } from '@reduxjs/toolkit';

import createSagaMiddleware from 'redux-saga';
import { composeWithStateSync } from 'electron-redux';

import uiReducer from './slice';

const sagaMiddleware = createSagaMiddleware();
const composedEnhancer = composeWithStateSync(applyMiddleware(sagaMiddleware));

const store = configureStore({
  reducer: { ui: uiReducer },
  enhancers: [composedEnhancer],
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export { sagaMiddleware };

export default store;
