/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@presenters/redux/store';
import { ICaptureArea, IOverlaysWindows } from '@presenters/redux/ui/types';
import { startCaptureAreaSelection } from '@presenters/redux/ui/slice';
import { getCurWindowCustomData } from '@utils/custom';

import { CaptureArea } from './CaptureArea';

import styles from './Cover.css';

const getScreenId = () => {
  return getCurWindowCustomData<number>('screenId');
};

const stretchBodySize = (w: number, h: number) => {
  document.body.style.width = `${w}px`;
  document.body.style.height = `${h}px`;
};

const adjustBodySize = (overlaysWindows: IOverlaysWindows) => {
  if (
    overlaysWindows === undefined ||
    Object.keys(overlaysWindows).length === 0
  ) {
    return;
  }

  const { screenInfo } = overlaysWindows[getScreenId()];
  stretchBodySize(screenInfo.width, screenInfo.height);
};

export const Cover = () => {
  const overlaysWindows: IOverlaysWindows = useSelector(
    (state: RootState) => state.ui.overlaysWindows
  );

  const captureArea: ICaptureArea = useSelector(
    (state: RootState) => state.ui.captureArea
  );

  const dispatch = useDispatch();

  useLayoutEffect(() => {
    adjustBodySize(overlaysWindows);
  }, [overlaysWindows]);

  return (
    <div className={styles.cursor}>
      <CaptureArea
        hidden={captureArea.screenIdOnSelection !== getScreenId()}
        onSelectionStart={() => {
          dispatch(startCaptureAreaSelection({ screenId: getScreenId() }));
        }}
      />
    </div>
  );
};
