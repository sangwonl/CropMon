import React from 'react';

import ControlPanel from '@ui/components/stateful/ControlPanel';
import { preventZoomKeyEvent } from '@ui/widgets/utils';

const Wrapper = () => <ControlPanel />;

export default () => {
  return <Wrapper />;
};

preventZoomKeyEvent();
