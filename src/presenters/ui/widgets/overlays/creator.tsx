/* eslint-disable react/display-name */

import React from 'react';
import { Provider } from 'react-redux';

import { CaptureCover } from '@presenters/ui/components/stateful/CaptureCover';
import store from '@presenters/redux/store';

const Wrapper = () => (
  <Provider store={store}>
    <CaptureCover />
  </Provider>
);

export default () => {
  return <Wrapper />;
};
