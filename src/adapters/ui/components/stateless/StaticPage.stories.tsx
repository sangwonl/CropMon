import type { ComponentMeta, ComponentStory } from '@storybook/react';

import React from 'react';

import StaticPage from '@adapters/ui/components/stateless/StaticPage';

export default {
  title: 'Kropsaurus/StaticPage',
  component: StaticPage,
  argTypes: {},
} as ComponentMeta<typeof StaticPage>;

const Template: ComponentStory<typeof StaticPage> = args => {
  return <StaticPage {...args} />;
};

const AsyncTemplate: ComponentStory<typeof StaticPage> = (_, { loaded }) => {
  return <StaticPage {...loaded} />;
};

export const MarkdownPage = Template.bind({});
MarkdownPage.args = {
  markdown: 'The best handy screen recorder, **Kropsaurus**',
};

export const HtmlPage = Template.bind({});
HtmlPage.args = {
  html: '<p>The best handy screen recorder, <b>Kropsaurus</b></p>',
};

export const ReleaseNotePage = AsyncTemplate.bind({});
ReleaseNotePage.loaders = [
  async () => {
    const content = await (await fetch('assets/docs/relnote.md')).text();
    return {
      markdown: content,
    };
  },
];
