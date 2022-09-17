import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import ToggleButton from '@adapters/ui/components/stateless/ToggleButton';

import closeIcon from '@assets/close.png';

export default {
  title: 'Kropsaurus/ToggleButton',
  component: ToggleButton,
  argTypes: {},
} as ComponentMeta<typeof ToggleButton>;

const handleToggle = action('onToggle');

const Template: ComponentStory<typeof ToggleButton> = () => {
  return (
    <div style={{ width: '300px', height: '60px' }}>
      <ToggleButton
        activeItemIndex={0}
        items={[
          { title: 'Full Screen' },
          { title: 'Selection' },
          { icon: closeIcon },
        ]}
        onToggle={handleToggle}
      />
    </div>
  );
};

export const Default = Template.bind({});
