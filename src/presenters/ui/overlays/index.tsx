import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from '@presenters/redux/store';

import './Overlays.css';
import AreaSelection from './AreaSelection';

ReactDOM.render(
  <Provider store={store}>
    <AreaSelection />
  </Provider>,
  document.getElementById('root')
);
