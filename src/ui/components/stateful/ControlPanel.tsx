/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';

import CaptureOptions from '@ui/components/stateless/CaptureOptions';

import { CaptureMode, IRecordOptions } from '@core/entities/capture';

import styles from '@ui/components/stateful/ControlPanel.css';

const ControlPanel = () => {
  // const dispatch = useDispatch();

  // const captureOverlay: ICaptureOverlay = useSelector(
  //   (state: RootState) => state.ui.root.captureOverlay
  // );

  return (
    <div className={styles.container}>
      <CaptureOptions
        onCaptureModeChange={(mode: CaptureMode) => {}}
        onRecordingOptionChange={(recOpt: IRecordOptions) => {}}
      />
    </div>
  );
};

export default ControlPanel;
