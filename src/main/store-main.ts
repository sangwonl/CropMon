/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import store, { RootState, sagaMiddleware } from '@ui/redux/store';
import uiSaga from '@ui/redux/saga';

export const initializeSaga = () => {
  sagaMiddleware.run(uiSaga);
};

export { RootState };

export default store;
