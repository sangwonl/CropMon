import React from 'react';

import CaptureCover from '@adapters/ui/components/stateful/CaptureOverlay';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

const Wrapper = () => <CaptureCover />;

export default () => {
  return <Wrapper />;
};

preventZoomKeyEvent();
