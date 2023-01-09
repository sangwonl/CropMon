import React from 'react';

import StaticPage from '@adapters/ui/components/stateless/StaticPage';
import { StaticPageModalOptions } from '@adapters/ui/widgets/staticpage/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

export default function StaticPageModalCreator(
  options: StaticPageModalOptions
) {
  const { markdown, html } = options;
  return <StaticPage markdown={markdown} html={html} />;
}

preventZoomKeyEvent();
