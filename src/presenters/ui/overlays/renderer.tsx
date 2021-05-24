import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from '@presenters/redux/store';

import { Cover } from './Cover';

ReactDOM.render(
  <Provider store={store}>
    <Cover />
  </Provider>,
  document.getElementById('root')
);
