import type { StoryObj } from '@storybook/react';

import React, { type ComponentProps } from 'react';

import { ProgressDialog } from '@adapters/ui/components/stateless/ProgressDialog';

export default {
  title: 'Kropsaurus/ProgressDialog',
  component: ProgressDialog,
};

type Story = StoryObj<typeof ProgressDialog>;

const Template = (args: ComponentProps<typeof ProgressDialog>) => (
  <div style={{ height: '400px' }}>
    <ProgressDialog {...args} />
  </div>
);

export const InProgressState: Story = {
  args: {
    title: 'In Progress Dialog',
    message: 'This is message',
    buttons: {
      cancelTitle: 'Cancel',
      actionTitle: 'Restart',
      actionHideInProgress: true,
    },
    progress: 40,
  },
  render: Template,
};

export const AlwaysShowActionButton: Story = {
  args: {
    title: 'In Progress Dialog',
    message: 'This is message',
    buttons: {
      cancelTitle: 'Cancel',
      actionTitle: 'Restart',
      actionHideInProgress: false,
    },
    progress: 40,
  },
  render: Template,
};

export const CompletedState: Story = {
  args: {
    title: 'Completed Progress Dialog',
    message: 'This is message',
    buttons: {
      cancelTitle: 'Cancel',
      actionTitle: 'Quit & Install',
      actionHideInProgress: true,
    },
    progress: 100,
  },
  render: Template,
};
