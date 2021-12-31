/* eslint-disable react/display-name */

import React from 'react';

import CaptureCover from '@ui/components/stateful/CaptureOverlay';
import { preventZoomKeyEvent } from '@ui/widgets/utils';

const Wrapper = () => <CaptureCover />;

export default () => {
  return <Wrapper />;
};

preventZoomKeyEvent();
