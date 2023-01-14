/* eslint-disable react/jsx-props-no-spreading */
import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React, { ComponentProps } from 'react';

import TogglableSelect from '@adapters/ui/components/stateless/TogglableSelect';

import micIcon from '@assets/mic.png';

export default {
  title: 'Kropsaurus/TogglableSelect',
  component: TogglableSelect,
  argTypes: {},
} as ComponentMeta<typeof TogglableSelect>;

const handleToggle = action('onToggle');
const handleSelect = action('onSelect');

const toggleButton: ComponentProps<typeof TogglableSelect>['toggleButton'] = {
  icon: micIcon,
  alt: 'Select items',
  active: true,
};

const items = [
  { checked: false, title: 'System Audio' },
  { checked: true, title: 'System Microphone' },
];

// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof TogglableSelect> = (args) => {
  return (
    <div style={{ width: '60px', height: '40px' }}>
      <TogglableSelect {...args} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  enabled: true,
  toggleButton,
  items,
  onToggle: (enabled: boolean) => {
    toggleButton.active = enabled;
    handleToggle(enabled);
  },
  onSelect: (indices: number[]) => {
    items.forEach((item, index) => {
      item.checked = indices.includes(index);
    });
    handleSelect(indices);
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  enabled: false,
  toggleButton,
  items,
  onToggle: (enabled: boolean) => {
    toggleButton.active = enabled;
    handleToggle(enabled);
  },
  onSelect: (indices: number[]) => {
    items.forEach((item, index) => {
      item.checked = indices.includes(index);
    });
    handleSelect(indices);
  },
};
