/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import store, { RootState, sagaMiddleware } from './store';

import uiSaga from './sagas/ui';
import captureSaga from './sagas/capture';

export const initializeSaga = () => {
  sagaMiddleware.run(uiSaga);
  sagaMiddleware.run(captureSaga);
};

export { RootState };

export default store;
