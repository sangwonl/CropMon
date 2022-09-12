/* eslint-disable react/jsx-props-no-spreading */

import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import ProgressBar from '@adapters/ui/components/stateless/ProgressBar';

export default {
  title: 'Kropsaurus/ProgressBar',
  component: ProgressBar,
  argTypes: {},
} as ComponentMeta<typeof ProgressBar>;

const Template: ComponentStory<typeof ProgressBar> = (args) => (
  <ProgressBar {...args} />
);

export const ZeroProgress = Template.bind({});
ZeroProgress.args = {
  progress: 0,
};

export const DoneProgress = Template.bind({});
DoneProgress.args = {
  progress: 100,
};
