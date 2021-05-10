/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@presenters/redux/store';
import { IScreenBounds } from '@presenters/redux/common/types';
import { ICaptureArea, IOverlaysWindows } from '@presenters/redux/ui/types';
import {
  startCaptureAreaSelection,
  finishCaptureAreaSelection,
  cancelCaptureAreaSelection,
} from '@presenters/redux/ui/slice';
import { startCapture } from '@presenters/redux/capture/slice';
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

  useLayoutEffect(() => {
    adjustBodySize(overlaysWindows);
  }, [overlaysWindows]);

  useLayoutEffect(() => {
    setCoverActive(captureArea.screenIdOnSelection === getScreenId());
  }, [captureArea]);

  const onSelectionStart = () => {
    dispatch(startCaptureAreaSelection({ screenId: getScreenId() }));
  };

  const onSelectionFinish = (bounds: IScreenBounds) => {
    dispatch(finishCaptureAreaSelection({ bounds }));
  };

  const onSelectionCancel = () => {
    dispatch(cancelCaptureAreaSelection());
  };

  const onRecordStart = () => {
    // FIXME: we need to move to capturing state
    dispatch(cancelCaptureAreaSelection());

    dispatch(
      startCapture({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        screenId: captureArea.screenIdOnSelection!,
        bounds: captureArea.selectedBounds,
      })
    );
  };

  return (
    <div className={styles.cover}>
      <CaptureArea
        active={coverActive}
        selectedBounds={captureArea.selectedBounds}
        onSelectionStart={onSelectionStart}
        onSelectionCancel={onSelectionCancel}
        onSelectionFinish={onSelectionFinish}
        onRecordStart={onRecordStart}
      />
    </div>
  );
};
