/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Story, Meta } from '@storybook/react';

import { CaptureMode } from '@domain/models/common';
import {
  PreferencesDialog,
  AppPreferencesProps,
} from '@adapters/ui/components/stateless/PreferencesDialog';

export default {
  title: 'Kropsaurus/Preferences',
  component: PreferencesDialog,
  argTypes: {},
} as Meta;

const Template: Story<AppPreferencesProps> = (args) => (
  <div
    style={{
      width: 600,
      height: 500,
      backgroundColor: '#ffffff',
      border: '1px solid #000',
    }}
  >
    <PreferencesDialog {...args} />
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
    outputFormat: 'mp4',
    captureMode: CaptureMode.AREA,
    colors: {
      selectingBackground: '#efefef',
      selectingText: '#232323',
      countdownBackground: '#efefef',
      countdownText: '#232323',
    },
  },
  selectedRecordHome: '/home/pineple/kropsaurus',
  onChooseRecordHome: () => {},
  onClose: () => {},
};
