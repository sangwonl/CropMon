import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import TogglableSelect from '@adapters/ui/components/stateless/TogglableSelect';

import micIcon from '@assets/mic.png';

export default {
  title: 'Kropsaurus/TogglableSelect',
  component: TogglableSelect,
  argTypes: {},
} as ComponentMeta<typeof TogglableSelect>;

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

// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof TogglableSelect> = () => {
  return (
    <div style={{ width: '60px', height: '40px' }}>
      <TogglableSelect
        toggleButton={toggleButton}
        items={items}
        onToggle={(enabled: boolean) => {
          toggleButton.enabled = enabled;
          handleToggle(enabled);
        }}
        onSelect={(indices: number[]) => {
          items.forEach((item, index) => {
            // eslint-disable-next-line no-param-reassign
            item.checked = indices.includes(index);
          });
          handleSelect(indices);
        }}
      />
    </div>
  );
};

export const Default = Template.bind({});
