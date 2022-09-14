/* eslint-disable react/jsx-props-no-spreading */

import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import ProgressDialog from '@adapters/ui/components/stateless/ProgressDialog';

export default {
  title: 'Kropsaurus/ProgressDialog',
  component: ProgressDialog,
  argTypes: {},
} as ComponentMeta<typeof ProgressDialog>;

const Template: ComponentStory<typeof ProgressDialog> = (args) => (
  <div style={{ height: '400px' }}>
    <ProgressDialog {...args} />
  </div>
);

export const InProgressState = Template.bind({});
InProgressState.args = {
  title: 'In Progress Dialog',
  message: 'This is message',
  buttons: {
    cancelTitle: 'Cancel',
    actionTitle: 'Restart',
    actionHideInProgress: true,
  },
  progress: 40,
};

export const AlwaysShowActionButton = Template.bind({});
AlwaysShowActionButton.args = {
  title: 'In Progress Dialog',
  message: 'This is message',
  buttons: {
    cancelTitle: 'Cancel',
    actionTitle: 'Restart',
    actionHideInProgress: false,
  },
  progress: 40,
};

export const CompletedState = Template.bind({});
CompletedState.args = {
  title: 'Completed Progress Dialog',
  message: 'This is message',
  buttons: {
    cancelTitle: 'Cancel',
    actionTitle: 'Restart',
    actionHideInProgress: true,
  },
  progress: 100,
};
