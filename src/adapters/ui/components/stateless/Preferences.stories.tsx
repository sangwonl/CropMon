import type { StoryObj } from '@storybook/react';

import React, { type ComponentProps } from 'react';

import { CaptureMode } from '@domain/models/common';
import type { Preferences } from '@domain/models/preferences';

import { PrefsPanels } from '@adapters/ui/components/stateless/PrefsPanels';

export default {
  title: 'Kropsaurus/Preferences',
  component: PrefsPanels,
};

type Story = StoryObj<typeof PrefsPanels>;

const Template = (args: ComponentProps<typeof PrefsPanels>) => (
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

const defaultArgs: ComponentProps<typeof PrefsPanels> = {
  appName: 'CropMon',
  version: '0.9.5',
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
  },
  onChooseRecordHome: () => {},
  onClose: () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSave: (_preferences: Preferences) => {},
};

export const Default: Story = {
  args: defaultArgs,
  render: Template,
};
