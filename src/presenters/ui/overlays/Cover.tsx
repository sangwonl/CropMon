/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@presenters/redux/store';
import { ICaptureArea, IOverlaysWindows } from '@presenters/redux/ui/types';
import {
  startCaptureAreaSelection,
  finishCaptureAreaSelection,
} from '@presenters/redux/ui/slice';
import { getCurWindowCustomData } from '@utils/custom';

import { SelectedBounds } from './types';
import { CaptureArea } from './CaptureArea';
import { ControlPanel } from './ControlPanel';

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
  stretchBodySize(screenInfo.bounds.width, screenInfo.bounds.height);
};

export const Cover = () => {
  const overlaysWindows: IOverlaysWindows = useSelector(
    (state: RootState) => state.ui.overlaysWindows
  );

  const captureArea: ICaptureArea = useSelector(
    (state: RootState) => state.ui.captureArea
  );

  const dispatch = useDispatch();

  const selectionStartHandler = () => {
    dispatch(startCaptureAreaSelection({ screenId: getScreenId() }));
  };

  const selectionFinishedHandler = (bounds: SelectedBounds) => {
    dispatch(finishCaptureAreaSelection({ bounds }));
  };

  useLayoutEffect(() => {
    adjustBodySize(overlaysWindows);
  }, [overlaysWindows]);

  const isCoverActive = (): boolean => {
    return captureArea.screenIdOnSelection === getScreenId();
  };

  return (
    <div className={styles.cover}>
      <CaptureArea
        active={isCoverActive()}
        onSelectionStart={selectionStartHandler}
        onSelectionFinished={selectionFinishedHandler}
      />
      <ControlPanel
        active={isCoverActive()}
        selectedBounds={captureArea.selectedBounds}
      />
    </div>
  );
};
