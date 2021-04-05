import { configureStore } from '@reduxjs/toolkit';
import { stateSyncEnhancer } from 'electron-redux';

import counterReducer from './counter/counterSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  enhancers: [stateSyncEnhancer()],
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
