/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import store, { sagaMiddleware } from './store';

import captureSaga from './capture/saga';

export const initializeSaga = () => {
  (store as any).saga = sagaMiddleware.run(captureSaga);
};

export default store;
