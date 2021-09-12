/* eslint-disable react-hooks/exhaustive-deps */

import React, { useLayoutEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IBounds } from '@core/entities/screen';
import { ICaptureArea, ICaptureOverlay } from '@core/entities/ui';
import { RootState } from '@ui/redux/store';
import {
  startAreaSelection,
  finishAreaSelection,
  disableCaptureMode,
  startCapture,
} from '@ui/redux/slice';
import { getCursorScreenPoint } from '@utils/remote';
import { isEmptyBounds } from '@utils/bounds';

import CaptureArea from '../stateless/CaptureArea';
import styles from './CaptureCover.css';

const stretchBodySize = (w: number, h: number) => {
  document.body.style.width = `${w}px`;
  document.body.style.height = `${h}px`;
};

const adjustBodySize = (captureOverlay: ICaptureOverlay) => {
  if (captureOverlay === undefined || captureOverlay.bounds === undefined) {
    return;
  }

  const { bounds } = captureOverlay;
  stretchBodySize(bounds.width, bounds.height);
};

const CaptureCover = () => {
  const dispatch = useDispatch();

  const captureOverlay: ICaptureOverlay = useSelector(
    (state: RootState) => state.ui.root.captureOverlay
  );

  const captureArea: ICaptureArea = useSelector(
    (state: RootState) => state.ui.root.captureArea
  );

  const onSelectionStart = useCallback(() => {
    dispatch(startAreaSelection());
  }, []);

  const onSelectionFinish = useCallback((bounds: IBounds) => {
    dispatch(finishAreaSelection({ bounds }));
  }, []);

  const onSelectionCancel = useCallback(() => {
    dispatch(disableCaptureMode());
  }, []);

  const onRecordingStart = useCallback((bounds: IBounds) => {
    dispatch(startCapture({ bounds }));
  }, []);

  useLayoutEffect(() => {
    adjustBodySize(captureOverlay);
  }, [captureOverlay]);

  return (
    <div className={styles.cover}>
      <CaptureArea
        active={captureArea.isSelecting}
        isRecording={captureArea.isRecording}
        boundsSelected={!isEmptyBounds(captureArea.selectedBounds)}
        showCountdown={captureOverlay.showCountdown}
        getCursorScreenPoint={getCursorScreenPoint}
        onSelectionStart={onSelectionStart}
        onSelectionCancel={onSelectionCancel}
        onSelectionFinish={onSelectionFinish}
        onRecordingStart={onRecordingStart}
      />
    </div>
  );
};

export default CaptureCover;
