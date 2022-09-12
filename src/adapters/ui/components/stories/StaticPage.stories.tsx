/* eslint-disable react/jsx-props-no-spreading */

import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import StaticPage from '@adapters/ui/components/stateless/StaticPage';

export default {
  title: 'Kropsaurus/StaticPage',
  component: StaticPage,
  argTypes: {},
} as ComponentMeta<typeof StaticPage>;

const Template: ComponentStory<typeof StaticPage> = (args) => (
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
