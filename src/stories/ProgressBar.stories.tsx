/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Story, Meta } from '@storybook/react';

import {
  ProgressBar,
  ProgressBarProps,
} from '@presenters/ui/stateless/components/progressbar';

export default {
  title: 'Kropsaurus/ProgressBar',
  component: ProgressBar,
  argTypes: {},
} as Meta;

const Template: Story<ProgressBarProps> = (args) => <ProgressBar {...args} />;

export const ZeroProgress = Template.bind({});
ZeroProgress.args = {
  progress: 0,
};

export const DoneProgress = Template.bind({});
DoneProgress.args = {
  progress: 100,
};
