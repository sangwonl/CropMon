import React from 'react';

import StaticPage from '@adapters/ui/components/stateless/StaticPage';
import { StaticPageModalOptions } from '@adapters/ui/widgets/staticpage/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

interface PropTypes {
  options: StaticPageModalOptions;
}

function Wrapper(props: PropTypes) {
  const { options } = props;
  return <StaticPage markdown={options.markdown} html={options.html} />;
}

export default function (options: StaticPageModalOptions) {
  return <Wrapper options={options} />;
}

preventZoomKeyEvent();
