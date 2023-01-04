import { ComponentMeta, ComponentStory } from '@storybook/react';
import React, { useState } from 'react';

import { RecordOptions } from '@domain/models/capture';
import { CaptureMode } from '@domain/models/common';

import CaptureControl from '@adapters/ui/components/stateless/CaptureControl';

export default {
  title: 'Kropsaurus/CaptureControl',
  component: CaptureControl,
  argTypes: {},
} as ComponentMeta<typeof CaptureControl>;

const Template: ComponentStory<typeof CaptureControl> = () => {
  const [captMode, setCaptMode] = useState<CaptureMode>(CaptureMode.AREA);
  const [recOpts, setRecOpts] = useState<RecordOptions>({
    outputAsGif: false,
    recordAudio: false,
    audioSources: [
      {
        id: '1234',
        name: 'PC Speakers',
        active: false,
      },
      {
        id: '1235',
        name: 'Builtin Microphone (Apple Silicon Macbook)',
        active: false,
      },
    ],
  });

  return (
    <div style={{ width: '420px', height: '56px' }}>
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
