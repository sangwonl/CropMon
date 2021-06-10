/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'debounce';

import { IBounds } from '@core/entities/screen';
import { RootState } from '@presenters/redux/store';
import { ICaptureArea, ICaptureOverlays } from '@presenters/redux/ui/types';
import {
  startAreaSelection,
  finishAreaSelection,
  disableAreaSelection,
} from '@presenters/redux/ui/slice';
import { startCapture } from '@presenters/redux/capture/slice';
import { focusCurWidget, getCurWidgetCustomData } from '@utils/remote';
import { isMac } from '@utils/process';

import { CaptureArea } from '../stateless/CaptureArea';
import styles from './CaptureCover.css';

const getScreenId = () => {
  return getCurWidgetCustomData<number>('screenId');
};

const stretchBodySize = (w: number, h: number) => {
  document.body.style.width = `${w}px`;
  document.body.style.height = `${h}px`;
};

// WORKAROUND: for MacOS to fix missing focus on second screen overlays
const focusCurWigetDebounced = (() => {
  if (isMac()) {
    return debounce(() => {
      focusCurWidget();
    }, 50);
  }
  return () => {};
})();

const adjustBodySize = (captureOverlays: ICaptureOverlays) => {
  if (
    captureOverlays === undefined ||
    Object.keys(captureOverlays).length === 0
  ) {
    return;
  }

  const { screenInfo } = captureOverlays[getScreenId()];
  stretchBodySize(screenInfo.bounds.width, screenInfo.bounds.height);
};

export const CaptureCover = () => {
  const dispatch = useDispatch();

  const captureOverlays: ICaptureOverlays = useSelector(
    (state: RootState) => state.ui.captureOverlays
  );

  const captureArea: ICaptureArea = useSelector(
    (state: RootState) => state.ui.captureArea
  );

  const [coverActive, setCoverActive] = useState<boolean>(false);

  useLayoutEffect(() => {
    adjustBodySize(captureOverlays);
  }, [captureOverlays]);

  useLayoutEffect(() => {
    setCoverActive(captureArea.screenIdOnSelection === getScreenId());
  }, [captureArea]);

  const onSelectionStart = () => {
    dispatch(startAreaSelection({ screenId: getScreenId() }));
  };

  const onSelectionFinish = (bounds: IBounds) => {
    dispatch(finishAreaSelection({ bounds }));
  };

  const onSelectionCancel = () => {
    dispatch(disableAreaSelection());
  };

  const onRecordStart = () => {
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
        onHovering={focusCurWigetDebounced}
      />
    </div>
  );
};
