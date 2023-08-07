import type { StoryObj } from '@storybook/react';

import { action } from '@storybook/addon-actions';
import React, { type ComponentProps } from 'react';

import TogglableSelect from '@adapters/ui/components/stateless/TogglableSelect';

import micIcon from '@assets/mic.png';

export default {
  title: 'Kropsaurus/TogglableSelect',
  component: TogglableSelect,
};

type Story = StoryObj<typeof TogglableSelect>;

const Template = (args: ComponentProps<typeof TogglableSelect>) => {
  return (
    <div style={{ width: '60px', height: '40px' }}>
      <TogglableSelect {...args} />
    </div>
  );
};

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

export const Default: Story = {
  args: {
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
  },
  render: Template,
};

export const Disabled: Story = {
  args: {
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
  },
  render: Template,
};
