/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@presenters/redux/store';
import { ICaptureArea, IOverlaysWindows } from '@presenters/redux/ui/types';
import {
  startCaptureAreaSelection,
  finishCaptureAreaSelection,
  cancelCaptureAreaSelection,
} from '@presenters/redux/ui/slice';
import { getCurWindowCustomData } from '@utils/custom';

import { SelectedBounds } from './types';
import { CaptureArea } from './CaptureArea';
import { ControlBox } from './ControlBox';

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
  const dispatch = useDispatch();

  const overlaysWindows: IOverlaysWindows = useSelector(
    (state: RootState) => state.ui.overlaysWindows
  );

  const captureArea: ICaptureArea = useSelector(
    (state: RootState) => state.ui.captureArea
  );

  const [coverActive, setCoverActive] = useState<boolean>(false);

  const selectionStartHandler = () => {
    dispatch(startCaptureAreaSelection({ screenId: getScreenId() }));
  };

  const selectionFinishHandler = (bounds: SelectedBounds) => {
    dispatch(finishCaptureAreaSelection({ bounds }));
  };

  const selectionCancelHandler = () => {
    dispatch(cancelCaptureAreaSelection());
  };

  useLayoutEffect(() => {
    adjustBodySize(overlaysWindows);
  }, [overlaysWindows]);

  useLayoutEffect(() => {
    setCoverActive(captureArea.screenIdOnSelection === getScreenId());
  }, [captureArea]);

  return (
    <div className={styles.cover}>
      <CaptureArea
        active={coverActive}
        selectedBounds={captureArea.selectedBounds}
        onSelectionStart={selectionStartHandler}
        onSelectionFinish={selectionFinishHandler}
        onSelectionCancel={selectionCancelHandler}
      />
      <ControlBox
        active={coverActive}
        selectedBounds={captureArea.selectedBounds}
      />
    </div>
  );
};
