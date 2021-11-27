/* eslint-disable react/display-name */

import React from 'react';
import { Provider } from 'react-redux';

import CaptureCover from '@ui/components/stateful/CaptureOverlay';
import store from '@ui/redux/store';
import { preventZoomKeyEvent } from '@ui/widgets/utils';

const Wrapper = () => (
  <Provider store={store}>
    <CaptureCover />
  </Provider>
);

export default () => {
  return <Wrapper />;
};

preventZoomKeyEvent();
