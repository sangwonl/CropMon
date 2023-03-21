/* eslint-disable react/function-component-definition */
/* eslint-disable react/jsx-props-no-spreading */

import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import StaticPage from '@adapters/ui/components/stateless/StaticPage';

export default {
  title: 'Kropsaurus/StaticPage',
  component: StaticPage,
  argTypes: {},
} as ComponentMeta<typeof StaticPage>;

const Template: ComponentStory<typeof StaticPage> = (args) => {
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

export const UnregisteredAboutPage = AsyncTemplate.bind({});
UnregisteredAboutPage.loaders = [
  async () => {
    const html = (await (await fetch('assets/docs/about.html')).text())
      .replace('__registration__', 'Unregistered')
      .replace('__shortcut__', 'Cmd + Shift + Enter')
      .replace('__version__', '1.0.0');
    return {
      html,
    };
  },
];

export const RegisteredAboutPage = AsyncTemplate.bind({});
RegisteredAboutPage.loaders = [
  async () => {
    const html = (await (await fetch('assets/docs/about.html')).text())
      .replace('__registration__', 'Registered')
      .replace('__shortcut__', 'Cmd + Shift + Enter')
      .replace('__version__', '1.0.0');
    return {
      html,
    };
  },
];
