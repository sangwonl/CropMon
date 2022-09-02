/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */

import { Story, Meta } from '@storybook/react';
import React, { useState } from 'react';

import { RecordOptions } from '@domain/models/capture';
import { CaptureMode } from '@domain/models/common';

import {
  CaptureOptions,
  CaptureOptionsProps,
} from '@adapters/ui/components/stateless/CaptureOptions';

export default {
  title: 'Kropsaurus/CaptureOptions',
  component: CaptureOptions,
  argTypes: {},
} as Meta;

const Template: Story<CaptureOptionsProps> = () => {
  const [captMode, setCaptMode] = useState<CaptureMode>(CaptureMode.AREA);
  const [recOpts, setRecOpts] = useState<RecordOptions>({
    enableOutputAsGif: false,
    enableMicrophone: false,
  });

  return (
    <div
      style={{
        width: 280,
        height: 56,
      }}
    >
      <CaptureOptions
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
