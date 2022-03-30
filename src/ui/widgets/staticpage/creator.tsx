import React, { FC } from 'react';

import { StaticPage } from '@ui/components/stateless/StaticPage';
import { preventZoomKeyEvent } from '@ui/widgets/utils';

import { StaticPageModalOptions } from './shared';

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
