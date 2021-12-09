/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CaptureMode } from '@core/entities/common';
import { IControlPanel } from '@core/entities/ui';
import { IRecordOptions } from '@core/entities/capture';

import { RootState } from '@ui/redux/store';
import CaptureOptions from '@ui/components/stateless/CaptureOptions';
import { changeCaptureOptions } from '@ui/redux/slice';
import styles from '@ui/components/stateful/ControlPanel.css';

const ControlPanel = () => {
  const dispatch = useDispatch();

  const controlPanel: IControlPanel = useSelector(
    (state: RootState) => state.ui.root.controlPanel
  );

  const composeOptions = useCallback(
    (mode?: CaptureMode, recOpts?: IRecordOptions) => {
      return {
        target: {
          mode: mode ?? controlPanel.captureMode,
        },
        recordOptions: {
          enableLowQualityMode:
            recOpts?.enableLowQualityMode ?? controlPanel.lowQualityMode,
          enableOutputAsGif:
            recOpts?.enableOutputAsGif ?? controlPanel.outputAsGif,
          enableRecordMicrophone:
            recOpts?.enableRecordMicrophone ?? controlPanel.recordMicrophone,
        },
      };
    },
    [controlPanel]
  );

  const handleCaptureModeChange = useCallback(
    (mode: CaptureMode) => {
      dispatch(changeCaptureOptions(composeOptions(mode)));
    },
    [controlPanel]
  );

  const handleRecOptionsChange = useCallback(
    (recOpts: IRecordOptions) => {
      dispatch(changeCaptureOptions(composeOptions(undefined, recOpts)));
    },
    [controlPanel]
  );

  return (
    <div className={styles.container}>
      <CaptureOptions
        onCaptureModeChange={handleCaptureModeChange}
        onRecordingOptionChange={handleRecOptionsChange}
      />
    </div>
  );
};

export default ControlPanel;
