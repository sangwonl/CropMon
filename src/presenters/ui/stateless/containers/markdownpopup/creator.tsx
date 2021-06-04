/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/display-name */

import React from 'react';

import { MarkdownPage } from '@presenters/ui/stateless/components/MarkdownPage';
import { getCurWindowCustomData } from '@utils/remote';

import { MarkdownPopupOptions } from './shared';

const options = getCurWindowCustomData<MarkdownPopupOptions>('options');

const Wrapper = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <MarkdownPage markdown={options.markdown} />
  </div>
);

export default () => {
  return <Wrapper />;
};
