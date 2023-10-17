import type { StoryObj } from '@storybook/react';

import { action } from '@storybook/addon-actions';
import React, { type ComponentProps } from 'react';

import { SwitchButton } from '@adapters/ui/components/stateless/SwitchButton';

import closeIcon from '@assets/close.png';
import micIcon from '@assets/mic.png';

export default {
  title: 'Kropsaurus/SwitchButton',
  component: SwitchButton,
};

type Story = StoryObj<typeof SwitchButton>;

const Template = (args: ComponentProps<typeof SwitchButton>) => {
  return (
    <div style={{ width: '80px', height: '40px' }}>
      <SwitchButton {...args} />
    </div>
  );
};

const handleToggle = action('onToggle');

export const Default: Story = {
  args: {
    activeItemIndex: 0,
    items: [
      { title: 'MP4', alt: 'Record as MP4' },
      { title: 'GIF', alt: 'Record as GIF' },
      { icon: closeIcon, alt: 'Close' },
    ],
    onSelect: handleToggle,
  },
  render: Template,
};

export const WithIcon: Story = {
  args: {
    ...Default.args,
    items: [
      { icon: micIcon, alt: 'Record audio' },
      { icon: closeIcon, alt: 'Close' },
    ],
  },
  render: Template,
};
