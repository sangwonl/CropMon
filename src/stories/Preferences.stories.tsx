/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Story, Meta } from '@storybook/react';

import {
  Preferences,
  PreferencesProps,
} from '@ui/components/stateless/Preferences';

export default {
  title: 'Kropsaurus/Preferences',
  component: Preferences,
  argTypes: {},
} as Meta;

const Template: Story<PreferencesProps> = (args) => (
  <div style={{ width: 600, padding: 20, backgroundColor: '#f1f1f1' }}>
    <Preferences {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  preferences: {
    version: '0.0.1',
    recordHome: '/home/pineple/kropsaurus',
    openRecordHomeWhenRecordCompleted: true,
    shortcut: 'Win + Shift + E',
  },
  onChooseRecordHome: () => {},
  onClose: () => {},
};
