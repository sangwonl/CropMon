/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { FC, useCallback, useState } from 'react';
import classNames from 'classnames';

import { CaptureMode } from '@core/entities/common';
import { IRecordOptions } from '@core/entities/capture';

import styles from '@ui/components/stateless/CaptureOptions.css';

export interface CaptureOptionsProps {
  initialCaptureMode: CaptureMode;
  initialRecordOptions: IRecordOptions;
  onCaptureModeChange: (mode: CaptureMode) => void;
  onRecordOptionsChange: (recOptions: IRecordOptions) => void;
}

export const CaptureOptions: FC<CaptureOptionsProps> = ({
  initialCaptureMode,
  initialRecordOptions,
  onCaptureModeChange,
  onRecordOptionsChange,
}: CaptureOptionsProps) => {
  const [captureMode, setCaptureMode] =
    useState<CaptureMode>(initialCaptureMode);
  const [recordOptions, setRecordOptions] =
    useState<IRecordOptions>(initialRecordOptions);

  const handleCaptModeChange = useCallback(
    (mode: CaptureMode) => {
      setCaptureMode(mode);
      onCaptureModeChange(mode);
    },
    [onCaptureModeChange]
  );

  const handleRecOptsChange = useCallback(
    (newRecOptions: IRecordOptions) => {
      setRecordOptions(newRecOptions);
      onRecordOptionsChange(newRecOptions);
    },
    [onRecordOptionsChange]
  );

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={classNames({
          [styles.toggled]: captureMode === CaptureMode.SCREEN,
        })}
        onClick={() => handleCaptModeChange(CaptureMode.SCREEN)}
      >
        Scr
      </button>
      <button
        type="button"
        className={classNames({
          [styles.toggled]: captureMode === CaptureMode.AREA,
        })}
        onClick={() => handleCaptModeChange(CaptureMode.AREA)}
      >
        Ara
      </button>
      <div className={styles.divider} />
      <button
        type="button"
        className={classNames({
          [styles.toggled]: recordOptions?.enableOutputAsGif,
        })}
        onClick={() =>
          handleRecOptsChange({
            ...recordOptions,
            enableOutputAsGif: !recordOptions?.enableOutputAsGif,
          })
        }
      >
        GIF
      </button>
      <button
        type="button"
        className={classNames({
          [styles.toggled]: recordOptions?.enableLowQualityMode,
        })}
        onClick={() =>
          handleRecOptsChange({
            ...recordOptions,
            enableLowQualityMode: !recordOptions?.enableLowQualityMode,
          })
        }
      >
        Low
      </button>
      <button
        type="button"
        className={classNames({
          [styles.toggled]: recordOptions?.enableMicrophone,
        })}
        onClick={() =>
          handleRecOptsChange({
            ...recordOptions,
            enableMicrophone: !recordOptions?.enableMicrophone,
          })
        }
      >
        Mic
      </button>
    </div>
  );
};
