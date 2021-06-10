/* eslint-disable react/display-name */

import React from 'react';
import { Provider } from 'react-redux';

import { Cover } from '@presenters/ui/containers/Cover';
import store from '@presenters/redux/store';

const Wrapper = () => (
  <Provider store={store}>
    <Cover />
  </Provider>
);

export default () => {
  return <Wrapper />;
};
