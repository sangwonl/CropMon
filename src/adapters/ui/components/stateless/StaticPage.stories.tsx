import type { StoryObj } from '@storybook/react';

import React, { type ComponentProps } from 'react';

import StaticPage from '@adapters/ui/components/stateless/StaticPage';

export default {
  title: 'Kropsaurus/StaticPage',
  component: StaticPage,
};

type Story = StoryObj<typeof StaticPage>;

const Template = (args: ComponentProps<typeof StaticPage>) => {
  return <StaticPage {...args} />;
};

const AsyncTemplate = (
  _ignored: unknown,
  { loaded: args }: { loaded: ComponentProps<typeof StaticPage> },
) => {
  return <StaticPage {...args} />;
};

export const MarkdownPage: Story = {
  args: {
    markdown: 'The best handy screen recorder, **Kropsaurus**',
  },
  render: Template,
};

export const HtmlPage: Story = {
  args: {
    html: '<p>The best handy screen recorder, <b>Kropsaurus</b></p>',
  },
  render: Template,
};

export const ReleaseNotePage: Story = {
  loaders: [
    async () => {
      const content = await (await fetch('docs/relnote.md')).text();
      return {
        markdown: content,
      };
    },
  ],
  render: AsyncTemplate,
};
