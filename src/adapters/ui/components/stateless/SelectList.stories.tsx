import type { StoryObj } from '@storybook/react';

import { action } from '@storybook/addon-actions';
import React, { type ComponentProps } from 'react';

import SelectList from '@adapters/ui/components/stateless/SelectList';

export default {
  title: 'Kropsaurus/SelectList',
  component: SelectList,
};

type Story = StoryObj<typeof SelectList>;

const Template = (args: ComponentProps<typeof SelectList>) => {
  return (
    <div style={{ height: '80px' }}>
      <SelectList {...args} />
    </div>
  );
};

const handleSelect = action('onSelect');

const items = [
  { checked: false, title: 'System Audio' },
  { checked: true, title: 'System Microphone' },
];

export const MultiSelectable: Story = {
  args: {
    multiSelect: true,
    items,
    onSelect: handleSelect,
  },
  render: Template,
};

export const SingleSelectable: Story = {
  args: {
    multiSelect: false,
    items,
    onSelect: handleSelect,
  },
  render: Template,
};
