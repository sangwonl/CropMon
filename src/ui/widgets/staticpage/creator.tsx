/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

import { getCurWidgetCustomData } from '@utils/remote';
import { StaticPage } from '@ui/components/stateless/StaticPage';

import { StaticPagePopupOptions } from './shared';

const options = getCurWidgetCustomData<StaticPagePopupOptions>('options');

const Wrapper = () => (
  <StaticPage markdown={options.markdown} html={options.html} />
);

export default () => {
  return <Wrapper />;
};
