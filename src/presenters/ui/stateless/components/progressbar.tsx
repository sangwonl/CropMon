/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import React, { useEffect, useState } from 'react';

export interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = (props: ProgressBarProps) => {
  const { progress } = props;
  return <div>{progress}</div>;
};
