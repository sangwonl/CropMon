import { applyMiddleware } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { composeWithStateSync } from 'electron-redux';
import createSagaMiddleware from 'redux-saga';

import counterReducer from './counter/counterSlice';
import saga from './saga';

const sagaMiddleware = createSagaMiddleware();

const middlewares = applyMiddleware(sagaMiddleware);
const composedEnhancer = composeWithStateSync(...[middlewares]);

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  enhancers: [composedEnhancer],
});

export const initializeStore = () => {
  // eslint-disable-next-line no-console
  console.log(store.getState());

  (store as any).saga = sagaMiddleware.run(saga);
};

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
