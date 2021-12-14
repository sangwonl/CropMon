/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */

import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';

import { CaptureMode } from '@core/entities/common';
import { IRecordOptions } from '@core/entities/capture';
import {
  CaptureOptions,
  CaptureOptionsProps,
} from '@ui/components/stateless/CaptureOptions';

export default {
  title: 'Kropsaurus/CaptureOptions',
  component: CaptureOptions,
  argTypes: {},
} as Meta;

const Template: Story<CaptureOptionsProps> = () => {
  const [captMode, setCaptMode] = useState<CaptureMode>(CaptureMode.AREA);
  const [recOpts, setRecOpts] = useState<IRecordOptions>({
    enableOutputAsGif: false,
    enableMicrophone: false,
    enableLowQualityMode: false,
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
