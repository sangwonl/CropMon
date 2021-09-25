/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Story, Meta } from '@storybook/react';

import Preferences, {
  PreferencesProps,
} from '@ui/components/stateless/Preferences';

export default {
  title: 'Kropsaurus/Preferences',
  component: Preferences,
  argTypes: {},
} as Meta;

const Template: Story<PreferencesProps> = (args) => (
  <div
    style={{
      width: 600,
      height: 500,
      backgroundColor: '#ffffff',
      border: '1px solid #000',
    }}
  >
    <Preferences {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  origPrefs: {
    initialLoaded: false,
    version: '0.0.1',
    runAtStartup: true,
    recordHome: '/home/pineple/kropsaurus',
    openRecordHomeWhenRecordCompleted: true,
    shortcut: 'Win + Shift + E',
    showCountdown: true,
    recordMicrophone: false,
    recordQualityMode: 'normal',
    outputFormat: 'mp4',
  },
  selectedRecordHome: '/home/pineple/kropsaurus',
  onChooseRecordHome: () => {},
  onClose: () => {},
};
