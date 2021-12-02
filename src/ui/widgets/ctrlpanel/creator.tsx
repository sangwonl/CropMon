/* eslint-disable react/display-name */

import React from 'react';
import { Provider } from 'react-redux';

import ControlPanel from '@ui/components/stateful/ControlPanel';
import store from '@ui/redux/store';
import { preventZoomKeyEvent } from '@ui/widgets/utils';

const Wrapper = () => (
  <Provider store={store}>
    <ControlPanel />
  </Provider>
);

export default () => {
  return <Wrapper />;
};

preventZoomKeyEvent();
