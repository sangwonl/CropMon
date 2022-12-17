import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import TogglableMultiSelect from '@adapters/ui/components/stateless/TogglableMultiSelect';

import micIcon from '@assets/mic.png';

export default {
  title: 'Kropsaurus/TogglableMultiSelect',
  component: TogglableMultiSelect,
  argTypes: {},
} as ComponentMeta<typeof TogglableMultiSelect>;

const handleToggle = action('onToggle');
const handleSelect = action('onSelect');

const toggleButton = {
  icon: micIcon,
  alt: 'Select items',
  enabled: false,
};

const items = [
  { checked: false, title: 'System Audio' },
  { checked: true, title: 'System Microphone' },
];

const Template: ComponentStory<typeof TogglableMultiSelect> = () => {
  return (
    <div style={{ width: '60px', height: '40px' }}>
      <TogglableMultiSelect
        toggleButton={toggleButton}
        items={items}
        onToggle={(enabled: boolean) => {
          toggleButton.enabled = enabled;
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
