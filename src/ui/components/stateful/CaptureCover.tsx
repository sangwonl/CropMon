/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { useLayoutEffect, useState } from 'react';
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
import { focusCurWidget } from '@utils/remote';
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
  const [selectedBounds, setSelectedBounds] =
    useState<IBounds | undefined>(undefined);

  useLayoutEffect(() => {
    adjustBodySize(captureOverlay);
  }, [captureOverlay]);

  useLayoutEffect(() => {
    setCoverActive(captureArea.isSelecting);
    setRecording(captureArea.isRecording);
    setSelectedBounds(captureArea.selectedBounds);
  }, [captureArea]);

  const onSelectionStart = () => {
    dispatch(startAreaSelection());
  };

  const onSelectionFinish = (bounds: IBounds) => {
    dispatch(finishAreaSelection({ bounds }));
  };

  const onSelectionCancel = () => {
    dispatch(disableCaptureMode());
  };

  return (
    <div className={styles.cover}>
      <CaptureArea
        active={coverActive}
        isRecording={recording}
        selectedBounds={selectedBounds}
        onSelectionStart={onSelectionStart}
        onSelectionCancel={onSelectionCancel}
        onSelectionFinish={onSelectionFinish}
        onHovering={focusCurWigetDebounced}
      />
    </div>
  );
};
