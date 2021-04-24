import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from '@presenters/redux/store';

import Preference from './Preference';

ReactDOM.render(
  <Provider store={store}>
    <Preference />
  </Provider>,
  document.getElementById('root')
);
