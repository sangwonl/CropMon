/* eslint-disable react/jsx-props-no-spreading */

import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import SwitchButton from '@adapters/ui/components/stateless/SwitchButton';

import closeIcon from '@assets/close.png';
import micIcon from '@assets/mic.png';

export default {
  title: 'Kropsaurus/SwitchButton',
  component: SwitchButton,
  argTypes: {},
} as ComponentMeta<typeof SwitchButton>;

const handleToggle = action('onToggle');

const Template: ComponentStory<typeof SwitchButton> = (args) => {
  return (
    <div style={{ width: '80px', height: '40px' }}>
      <SwitchButton {...args} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  activeItemIndex: 0,
  items: [{ title: 'MP4' }, { title: 'GIF' }, { icon: closeIcon }],
  onSelect: handleToggle,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  ...Default.args,
  items: [{ icon: micIcon }, { icon: closeIcon }],
};
