/* eslint-disable react/jsx-props-no-spreading */

import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import SelectList from '@adapters/ui/components/stateless/SelectList';

export default {
  title: 'Kropsaurus/SelectList',
  component: SelectList,
  argTypes: {},
} as ComponentMeta<typeof SelectList>;

const handleSelect = action('onSelect');

const items = [
  { checked: false, title: 'System Audio' },
  { checked: true, title: 'System Microphone' },
];

// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof SelectList> = (args) => {
  return (
    <div style={{ height: '80px' }}>
      <SelectList {...args} />
    </div>
  );
};

export const MultiSelectable = Template.bind({});
MultiSelectable.args = {
  multiSelect: true,
  items,
  onSelect: handleSelect,
};

export const SingleSelectable = Template.bind({});
SingleSelectable.args = {
  multiSelect: false,
  items,
  onSelect: handleSelect,
};
