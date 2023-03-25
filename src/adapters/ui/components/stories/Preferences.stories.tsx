/* eslint-disable react/jsx-props-no-spreading */

import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { CaptureMode } from '@domain/models/common';

import PreferencesDialog from '@adapters/ui/components/stateless/PreferencesDialog';

export default {
  title: 'Kropsaurus/Preferences',
  component: PreferencesDialog,
  argTypes: {},
} as ComponentMeta<typeof PreferencesDialog>;

// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof PreferencesDialog> = (args) => (
  <div
    style={{
      width: 700,
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
  version: '0.9.5',
  license: null,
  prefs: {
    initialLoaded: false,
    version: '0.0.1',
    runAtStartup: true,
    recordHome: '/home/pineple/kropsaurus',
    openRecordHomeWhenRecordCompleted: true,
    shortcut: 'Win + Shift + E',
    showCountdown: true,
    recordAudio: false,
    audioSources: [],
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
