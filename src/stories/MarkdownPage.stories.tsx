/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Story, Meta } from '@storybook/react';

import {
  MarkdownPage,
  MarkdownPageProps,
} from '@presenters/ui/stateless/components/MarkdownPage';

export default {
  title: 'Kropsaurus/MarkdownPage',
  component: MarkdownPage,
  argTypes: {},
} as Meta;

const Template: Story<MarkdownPageProps> = (args) => (
  <div style={{ width: 400, height: 300 }}>
    <MarkdownPage {...args} />
  </div>
);

export const BasicMarkdownPage = Template.bind({});
BasicMarkdownPage.args = {
  markdown: 'The best handy screen recorder, *Kropsaurus*',
};
