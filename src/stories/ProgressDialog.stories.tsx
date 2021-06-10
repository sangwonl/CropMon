/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Story, Meta } from '@storybook/react';

import {
  ProgressDialog,
  ProgressDialogProps,
} from '@presenters/ui/components/ProgressDialog';

export default {
  title: 'Kropsaurus/ProgressDialog',
  component: ProgressDialog,
  argTypes: {},
} as Meta;

const Template: Story<ProgressDialogProps> = (args) => (
  <ProgressDialog {...args} />
);

export const BasicState = Template.bind({});
BasicState.args = {
  title: 'Basic Progress Dialog',
  message: 'This is message',
  buttons: {
    cancelTitle: 'Cancel',
    actionTitle: 'Restart',
    actionHideInProgress: true,
  },
};

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
