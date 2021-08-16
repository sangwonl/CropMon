/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { useLayoutEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'debounce';

import { IBounds } from '@core/entities/screen';
import { ICaptureArea, ICaptureOverlay } from '@core/entities/ui';
import { RootState } from '@ui/redux/store';
import {
  startAreaSelection,
  finishAreaSelection,
  disableCaptureMode,
} from '@ui/redux/slice';
import { focusCurWidget, getCursorScreenPoint } from '@utils/remote';
import { isEmptyBounds } from '@utils/bounds';
import { isMac } from '@utils/process';

import { CaptureArea } from '../stateless/CaptureArea';
import styles from './CaptureCover.css';

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

const adjustBodySize = (captureOverlay: ICaptureOverlay) => {
  if (captureOverlay === undefined || captureOverlay.bounds === undefined) {
    return;
  }

  const { bounds } = captureOverlay;
  stretchBodySize(bounds.width, bounds.height);
};

export const CaptureCover = () => {
  const dispatch = useDispatch();

  const captureOverlay: ICaptureOverlay = useSelector(
    (state: RootState) => state.ui.root.captureOverlay
  );

  const captureArea: ICaptureArea = useSelector(
    (state: RootState) => state.ui.root.captureArea
  );

  const [coverActive, setCoverActive] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [boundsSelected, setBoundsSelected] = useState<boolean>(false);

  const onSelectionStart = useCallback(() => {
    dispatch(startAreaSelection());
  }, []);

  const onSelectionFinish = useCallback((bounds: IBounds) => {
    dispatch(finishAreaSelection({ bounds }));
  }, []);

  const onSelectionCancel = useCallback(() => {
    dispatch(disableCaptureMode());
  }, []);

  useLayoutEffect(() => {
    adjustBodySize(captureOverlay);
  }, [captureOverlay]);

  useLayoutEffect(() => {
    setCoverActive(captureArea.isSelecting);
    setRecording(captureArea.isRecording);
    setBoundsSelected(!isEmptyBounds(captureArea.selectedBounds));
  }, [captureArea]);

  return (
    <div className={styles.cover}>
      <CaptureArea
        active={coverActive}
        isRecording={recording}
        boundsSelected={boundsSelected}
        getCursorScreenPoint={getCursorScreenPoint}
        onSelectionStart={onSelectionStart}
        onSelectionCancel={onSelectionCancel}
        onSelectionFinish={onSelectionFinish}
        onHovering={focusCurWigetDebounced}
      />
    </div>
  );
};
