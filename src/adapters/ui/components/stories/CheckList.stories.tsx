import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import CheckList from '@adapters/ui/components/stateless/CheckList';

export default {
  title: 'Kropsaurus/CheckList',
  component: CheckList,
  argTypes: {},
} as ComponentMeta<typeof CheckList>;

const handleSelect = action('onSelect');

const items = ['System Audio', 'System Microphone'];

const Template: ComponentStory<typeof CheckList> = () => {
  return (
    <div style={{ height: '80px' }}>
      <CheckList items={items} onSelect={handleSelect} />
    </div>
  );
};

export const Default = Template.bind({});
