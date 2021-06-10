/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

import { getCurWidgetCustomData } from '@utils/remote';
import { StaticPage } from '@presenters/ui/components/stateless/StaticPage';

import { StaticPagePopupOptions } from './shared';

const options = getCurWidgetCustomData<StaticPagePopupOptions>('options');

const Wrapper = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <StaticPage markdown={options.markdown} html={options.html} />
  </div>
);

export default () => {
  return <Wrapper />;
};
