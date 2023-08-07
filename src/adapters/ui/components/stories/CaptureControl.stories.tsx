import type { ComponentMeta, ComponentStory } from '@storybook/react';

import React, { useState } from 'react';

import type { RecordOptions } from '@domain/models/capture';
import { CaptureMode } from '@domain/models/common';

import CaptureControl from '@adapters/ui/components/stateless/CaptureControl';

export default {
  title: 'Kropsaurus/CaptureControl',
  component: CaptureControl,
  argTypes: {},
} as ComponentMeta<typeof CaptureControl>;

const Template: ComponentStory<typeof CaptureControl> = ({
  captureMode,
  recordOptions,
}) => {
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

export const Default = Template.bind({});
Default.args = {
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
};

export const NoAudioSources = Template.bind({});
NoAudioSources.args = {
  captureMode: CaptureMode.AREA,
  recordOptions: {
    outputAsGif: false,
    recordAudio: true,
    audioSources: [],
  },
};