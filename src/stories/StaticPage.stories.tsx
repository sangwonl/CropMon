/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Story, Meta } from '@storybook/react';

import {
  StaticPage,
  StaticPageProps,
} from '@presenters/ui/stateless/components/StaticPage';

export default {
  title: 'Kropsaurus/StaticPage',
  component: StaticPage,
  argTypes: {},
} as Meta;

const Template: Story<StaticPageProps> = (args) => (
  <div style={{ width: 400, height: 300 }}>
    <StaticPage {...args} />
  </div>
);

export const MarkdownPage = Template.bind({});
MarkdownPage.args = {
  markdown: 'The best handy screen recorder, **Kropsaurus**',
};

export const HtmlPage = Template.bind({});
HtmlPage.args = {
  html: '<p>The best handy screen recorder, <b>Kropsaurus</b></p>',
};
