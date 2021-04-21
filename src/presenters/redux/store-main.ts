/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import store, { RootState, sagaMiddleware } from './store';

import uiSaga from './ui/saga';
import captureSaga from './capture/saga';

export const initializeSaga = () => {
  sagaMiddleware.run(uiSaga);
  sagaMiddleware.run(captureSaga);
};

export { RootState };

export default store;
