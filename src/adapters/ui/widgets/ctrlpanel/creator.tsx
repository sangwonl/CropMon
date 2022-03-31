import React from 'react';

import ControlPanel from '@adapters/ui/components/stateful/ControlPanel';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

const Wrapper = () => <ControlPanel />;

export default () => {
  return <Wrapper />;
};

preventZoomKeyEvent();
