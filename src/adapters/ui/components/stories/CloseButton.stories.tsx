/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */

import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import CloseButton from '@adapters/ui/components/stateless/CloseButton';

export default {
  title: 'Kropsaurus/CloseButton',
  component: CloseButton,
  argTypes: {},
} as ComponentMeta<typeof CloseButton>;

const handleClick = action('onClick');

const Template: ComponentStory<typeof CloseButton> = () => {
  return (
    <div style={{ height: '40px' }}>
      <CloseButton onClick={handleClick} />
    </div>
  );
};

export const Default = Template.bind({});
