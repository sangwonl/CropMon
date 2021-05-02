/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@presenters/redux/store';
import { getCurWindowCustomData } from '@utils/custom';

import './Cover.css';
import { CaptureArea } from './CaptureArea';

export const Cover = () => {
  const overlaysWindows = useSelector(
    (state: RootState) => state.ui.overlaysWindows
  );

  useEffect(() => {
    if (overlaysWindows === undefined) {
      return;
    }

    const screenId = getCurWindowCustomData<number>('screenId');
    const { screenInfo } = overlaysWindows[screenId];

    document.body.style.width = `${screenInfo.width}px`;
    document.body.style.height = `${screenInfo.height}px`;
  }, [overlaysWindows]);

  return (
    <div>
      <CaptureArea />;
    </div>
  );
};
