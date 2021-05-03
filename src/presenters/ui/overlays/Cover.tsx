/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@presenters/redux/store';
import { IOverlaysWindows } from '@presenters/redux/ui/types';
import { getCurWindowCustomData } from '@utils/custom';

import { CaptureArea } from './CaptureArea';

import styles from './Cover.css';

const stretchBodySize = (w: number, h: number) => {
  document.body.style.width = `${w}px`;
  document.body.style.height = `${h}px`;
};

export const Cover = () => {
  const overlaysWindows: IOverlaysWindows = useSelector(
    (state: RootState) => state.ui.overlaysWindows
  );

  useLayoutEffect(() => {
    if (
      overlaysWindows === undefined ||
      Object.keys(overlaysWindows).length === 0
    ) {
      return;
    }

    const screenId = getCurWindowCustomData<number>('screenId');
    const { screenInfo } = overlaysWindows[screenId];
    stretchBodySize(screenInfo.width, screenInfo.height);
  }, [overlaysWindows]);

  return (
    <div className={styles.cursor}>
      <CaptureArea />
    </div>
  );
};
