import React from 'react';

import CaptureOverlay from '@adapters/ui/components/stateful/CaptureOverlay';
import { CaptureOverlayOptions } from '@adapters/ui/widgets/overlays/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

export default function CaptureOverlayCreator(options: CaptureOverlayOptions) {
  const { screenId } = options;
  return <CaptureOverlay assignedScreenId={screenId} />;
}

preventZoomKeyEvent();
