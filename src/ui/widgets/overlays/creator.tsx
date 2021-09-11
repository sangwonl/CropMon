/* eslint-disable react/display-name */

import React from 'react';
import { Provider } from 'react-redux';

import CaptureCover from '@ui/components/stateful/CaptureCover';
import store from '@ui/redux/store';

const Wrapper = () => (
  <Provider store={store}>
    <CaptureCover />
  </Provider>
);

export default () => {
  return <Wrapper />;
};
