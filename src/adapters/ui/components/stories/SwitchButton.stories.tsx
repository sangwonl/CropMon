import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import SwitchButton from '@adapters/ui/components/stateless/SwitchButton';

import closeIcon from '@assets/close.png';

export default {
  title: 'Kropsaurus/SwitchButton',
  component: SwitchButton,
  argTypes: {},
} as ComponentMeta<typeof SwitchButton>;

const handleToggle = action('onToggle');

const Template: ComponentStory<typeof SwitchButton> = () => {
  return (
    <div style={{ width: '300px', height: '60px' }}>
      <SwitchButton
        activeItemIndex={0}
        items={[
          { title: 'Full Screen' },
          { title: 'Selection' },
          { icon: closeIcon },
        ]}
        onSelect={handleToggle}
      />
    </div>
  );
};

export const Default = Template.bind({});
