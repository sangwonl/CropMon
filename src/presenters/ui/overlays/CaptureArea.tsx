/* eslint-disable import/prefer-default-export */

import React from 'react';
import { rgba } from 'polished';

import './CaptureArea.css';

export const CaptureArea = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: rgba(20, 20, 20, 0.3),
        color: 'black',
      }}
    >
      Hello
    </div>
  );
};
