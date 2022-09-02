import React, { FC } from 'react';

import { StaticPage } from '@adapters/ui/components/stateless/StaticPage';
import { StaticPageModalOptions } from '@adapters/ui/widgets/staticpage/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

interface PropTypes {
  options: StaticPageModalOptions;
}

const Wrapper: FC<PropTypes> = (props: PropTypes) => {
  const { options } = props;
  return <StaticPage markdown={options.markdown} html={options.html} />;
};

export default (options: StaticPageModalOptions) => {
  return <Wrapper options={options} />;
};

preventZoomKeyEvent();
