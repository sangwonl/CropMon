/* eslint-disable react/jsx-props-no-spreading */

import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { CaptureMode } from '@domain/models/common';

import PrefsPanels from '@adapters/ui/components/stateless/PrefsPanels';

export default {
  title: 'Kropsaurus/Preferences',
  component: PrefsPanels,
  argTypes: {},
} as ComponentMeta<typeof PrefsPanels>;

// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof PrefsPanels> = (args) => (
  <div
    style={{
      width: 700,
      height: 500,
      backgroundColor: '#ffffff',
      border: '1px solid #000',
    }}
  >
    <PrefsPanels {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  version: '0.9.5',
  license: null,
  recordHome: '/home/pineple/kropsaurus',
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
    license: null,
  },
  onChooseRecordHome: () => {},
  onClose: () => {},
};
