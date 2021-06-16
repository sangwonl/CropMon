/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Story, Meta } from '@storybook/react';

import {
  BasePreferences,
  BasePreferencesProps,
} from '@presenters/ui/components/stateless/BasePreferences';

export default {
  title: 'Kropsaurus/BasePreferences',
  component: BasePreferences,
  argTypes: {},
} as Meta;

const Template: Story<BasePreferencesProps> = (args) => (
  <div style={{ width: 600, padding: 20, backgroundColor: '#f1f1f1' }}>
    <BasePreferences {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  prefs: {
    version: '0.0.1',
    recordHomeDir: '/home/pineple/kropsaurus',
    openRecordHomeDirWhenRecordCompleted: true,
    shortcut: 'Super+Shift+E',
  },
  onChooseRecordHomeDir: () => {},
  onToggleOpenRecordHomeDir: () => {},
  onClose: () => {},
};
