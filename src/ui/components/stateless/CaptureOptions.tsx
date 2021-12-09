/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, useCallback } from 'react';

import { CaptureMode } from '@core/entities/common';
import { IRecordOptions } from '@core/entities/capture';

import styles from '@ui/components/stateless/CaptureOptions.css';

interface PropTypes {
  onCaptureModeChange: (mode: CaptureMode) => void;
  onRecordingOptionChange: (recOptions: IRecordOptions) => void;
}

const CaptureOptions: FC<PropTypes> = ({
  onCaptureModeChange,
  onRecordingOptionChange,
}: PropTypes) => {
  const handleCaptModeChange = useCallback(
    (mode: CaptureMode) => {
      onCaptureModeChange(mode);
    },
    [onCaptureModeChange]
  );

  const handleRecOptChange = useCallback(() => {
    onRecordingOptionChange({
      enableLowQualityMode: false,
      enableRecordMicrophone: false,
      enableOutputAsGif: false,
    });
  }, [onRecordingOptionChange]);

  return (
    <div className={styles.container}>
      <div
        className={styles.button}
        onClick={() => handleCaptModeChange(CaptureMode.SCREEN)}
      >
        Fullscreen
      </div>
      <div
        className={styles.button}
        onClick={() => handleCaptModeChange(CaptureMode.AREA)}
      >
        Area
      </div>
      <div className={styles.button} onClick={() => handleRecOptChange()}>
        Recording Options
      </div>
    </div>
  );
};

export default CaptureOptions;
