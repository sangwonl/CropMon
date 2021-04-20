/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import store, { RootState, sagaMiddleware } from './store';

import captureSaga from './capture/saga';

export const initializeSaga = () => {
  (store as any).saga = sagaMiddleware.run(captureSaga);
};

export { RootState };

export default store;
