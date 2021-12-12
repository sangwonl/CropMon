/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
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

const Template: Story<CaptureOptionsProps> = (args) => (
  <div
    style={{
      width: 240,
      height: 40,
    }}
  >
    <CaptureOptions {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  onCaptureModeChange: (_mode: CaptureMode) => {},
  onRecordOptionsChange: (_recOpts: IRecordOptions) => {},
};
