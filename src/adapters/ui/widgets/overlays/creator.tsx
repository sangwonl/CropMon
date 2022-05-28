import React from 'react';

import CaptureOverlay from '@adapters/ui/components/stateful/CaptureOverlay';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

const Wrapper = () => <CaptureOverlay />;

export default () => {
  return <Wrapper />;
};

preventZoomKeyEvent();
