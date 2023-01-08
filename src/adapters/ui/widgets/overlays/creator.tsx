import React from 'react';

import CaptureOverlay from '@adapters/ui/components/stateful/CaptureOverlay';
import { CaptureOverlayOptions } from '@adapters/ui/widgets/overlays/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

interface PropTypes {
  assignedScreenId: number;
}

function Wrapper(props: PropTypes) {
  const { assignedScreenId } = props;
  return <CaptureOverlay assignedScreenId={assignedScreenId} />;
}

export default function (options: CaptureOverlayOptions) {
  const { screenId } = options;
  return <Wrapper assignedScreenId={screenId} />;
}

preventZoomKeyEvent();
