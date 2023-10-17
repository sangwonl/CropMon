import type { StoryObj } from '@storybook/react';

import React, { ComponentProps } from 'react';

import { ProgressBar } from '@adapters/ui/components/stateless/ProgressBar';

export default {
  title: 'Kropsaurus/ProgressBar',
  component: ProgressBar,
};

type Story = StoryObj<typeof ProgressBar>;

const Template = (args: ComponentProps<typeof ProgressBar>) => (
  <div style={{ height: '40px' }}>
    <ProgressBar {...args} />
  </div>
);

export const ZeroProgress: Story = {
  args: {
    progress: 0,
  },
  render: Template,
};

export const DoneProgress: Story = {
  args: {
    progress: 100,
  },
  render: Template,
};
