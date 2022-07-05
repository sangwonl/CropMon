import React from 'react';

import CaptureOverlay from '@adapters/ui/components/stateful/CaptureOverlay';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';
import { CaptureOverlayOptions } from '@adapters/ui/widgets/overlays/shared';

interface PropTypes {
  assignedScreenId: number;
}

const Wrapper = (props: PropTypes) => {
  const { assignedScreenId } = props;
  return <CaptureOverlay assignedScreenId={assignedScreenId} />;
};

export default (options: CaptureOverlayOptions) => {
  const { screenId } = options;
  return <Wrapper assignedScreenId={screenId} />;
};

preventZoomKeyEvent();
