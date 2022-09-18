import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import TogglableMultiSelect from '@adapters/ui/components/stateless/TogglableMultiSelect';

import closeIcon from '@assets/close.png';

export default {
  title: 'Kropsaurus/TogglableMultiSelect',
  component: TogglableMultiSelect,
  argTypes: {},
} as ComponentMeta<typeof TogglableMultiSelect>;

const handleToggle = action('onToggle');
const handleSelect = action('onSelect');

const togglButton = {
  icon: closeIcon,
  alt: 'Select items',
  enabled: true,
};

const items = [
  { checked: false, title: 'System Audio' },
  { checked: true, title: 'System Microphone' },
];

const Template: ComponentStory<typeof TogglableMultiSelect> = () => {
  return (
    <div style={{ width: '80px', height: '40px' }}>
      <TogglableMultiSelect
        toggleButton={togglButton}
        items={items}
        onToggle={(enabled: boolean) => {
          togglButton.enabled = enabled;
          handleToggle(enabled);
        }}
        onSelect={(indices: number[]) => {
          items.forEach((item, index) => {
            item.checked = indices.includes(index);
          });
          handleSelect(indices);
        }}
      />
    </div>
  );
};

export const Default = Template.bind({});
