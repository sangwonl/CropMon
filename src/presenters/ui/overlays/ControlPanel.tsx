/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, { useState, MouseEvent, Dispatch, SetStateAction } from 'react';

import { SelectedBounds } from './types';

import styles from './ControlPanel.css';

interface PropTypes {
  active: boolean;
  selectedBounds: SelectedBounds;
}

export const ControlPanel = (props: PropTypes) => {
  const { active, selectedBounds: bounds } = props;
  return (
    <div
      hidden={!active}
      style={{
        position: 'absolute',
        marginLeft: 0,
        marginTop: 0,
        marginBottom: 0,
        marginRight: 0,
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        backgroundColor: 'red',
        color: 'black',
      }}
    />
  );
};
