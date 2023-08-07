import React from 'react';

import StaticPage from '@adapters/ui/components/stateless/StaticPage';
import type { StaticPageDialogOptions } from '@adapters/ui/widgets/staticpage/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

export default function StaticPageDialogCreator(
  options: StaticPageDialogOptions,
) {
  const { markdown, html } = options;
  return <StaticPage markdown={markdown} html={html} />;
}

preventZoomKeyEvent();
