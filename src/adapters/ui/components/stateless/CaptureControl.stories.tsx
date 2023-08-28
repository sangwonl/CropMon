import type { StoryObj } from '@storybook/react';

import React, { useState, type ComponentProps } from 'react';

import type { RecordOptions } from '@domain/models/capture';
import { CaptureMode } from '@domain/models/common';

import { CaptureControl } from '@adapters/ui/components/stateless/CaptureControl';

export default {
  title: 'Kropsaurus/CaptureControl',
  component: CaptureControl,
};

type Story = StoryObj<typeof CaptureControl>;

const Template = (args: ComponentProps<typeof CaptureControl>) => {
  const { captureMode, recordOptions } = args;

  const [captMode, setCaptMode] = useState<CaptureMode>(captureMode);
  const [recOpts, setRecOpts] = useState<RecordOptions>(recordOptions);

  return (
    <div style={{ width: '400px', height: '56px' }}>
      <CaptureControl
        captureMode={captMode}
        recordOptions={recOpts}
        onCaptureModeChange={setCaptMode}
        onRecordOptionsChange={setRecOpts}
        onCaptureCancel={() => {}}
      />
    </div>
  );
};

export const Default: Story = {
  args: {
    captureMode: CaptureMode.AREA,
    recordOptions: {
      outputAsGif: false,
      recordAudio: true,
      audioSources: [
        {
          id: '1234',
          name: 'PC Speakers',
          active: false,
        },
        {
          id: '1235',
          name: 'Builtin Microphone (Apple Silicon Macbook)',
          active: true,
        },
      ],
    },
  },
  render: Template,
};

export const NoAudioSources: Story = {
  args: {
    captureMode: CaptureMode.AREA,
    recordOptions: {
      outputAsGif: false,
      recordAudio: true,
      audioSources: [],
    },
  },
  render: Template,
};
