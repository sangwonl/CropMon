import type { StoryObj } from '@storybook/react';

import { action } from '@storybook/addon-actions';
import React from 'react';

import CloseButton from '@adapters/ui/components/stateless/CloseButton';

export default {
  title: 'Kropsaurus/CloseButton',
  component: CloseButton,
};

type Story = StoryObj<typeof CloseButton>;

const handleClick = action('onClick');

const Template = () => {
  return (
    <div style={{ height: '40px' }}>
      <CloseButton onClick={handleClick} />
    </div>
  );
};

export const Default: Story = {
  render: Template,
};
