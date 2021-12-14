/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { FC, useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';

import { CaptureMode } from '@core/entities/common';
import { IRecordOptions } from '@core/entities/capture';

import styles from '@ui/components/stateless/CaptureOptions.css';
import screenIcon from '@assets/screen.png';
import cropIcon from '@assets/crop.png';
import closeIcon from '@assets/close.png';

export interface CaptureOptionsProps {
  captureMode: CaptureMode;
  recordOptions: IRecordOptions;
  onCaptureModeChange: (mode: CaptureMode) => void;
  onRecordOptionsChange: (recOptions: IRecordOptions) => void;
  onCaptureCancel: () => void;
}

export const CaptureOptions: FC<CaptureOptionsProps> = ({
  captureMode,
  recordOptions,
  onCaptureModeChange,
  onRecordOptionsChange,
  onCaptureCancel,
}: CaptureOptionsProps) => {
  const [captMode, setCaptMode] = useState<CaptureMode>(captureMode);
  const [recOpts, setRecOpts] = useState<IRecordOptions>(recordOptions);

  const handleCaptModeChange = useCallback(
    (mode: CaptureMode) => {
      setCaptMode(mode);
      onCaptureModeChange(mode);
    },
    [onCaptureModeChange]
  );

  const handleRecOptsChange = useCallback(
    (opts: IRecordOptions) => {
      setRecOpts(opts);
      onRecordOptionsChange(opts);
    },
    [onRecordOptionsChange]
  );

  useEffect(() => {
    if (captureMode !== captMode) {
      setCaptMode(captureMode);
    }

    if (recordOptions !== recOpts) {
      setRecOpts(recordOptions);
    }
  }, [captureMode, recordOptions]);

  return (
    <div className={styles.container}>
      <button
        type="button"
        title="Record Screen"
        className={classNames(styles.btnCaptMode, {
          [styles.toggled]: captMode === CaptureMode.SCREEN,
        })}
        onClick={() => handleCaptModeChange(CaptureMode.SCREEN)}
      >
        <img src={screenIcon} />
      </button>
      <button
        type="button"
        title="Record Selected Area"
        className={classNames(styles.btnCaptMode, {
          [styles.toggled]: captMode === CaptureMode.AREA,
        })}
        onClick={() => handleCaptModeChange(CaptureMode.AREA)}
      >
        <img src={cropIcon} />
      </button>
      <div className={styles.divider} />
      <button
        type="button"
        title="Output as MP4"
        className={classNames(styles.btnOutputMp4, {
          [styles.toggled]: !recOpts.enableOutputAsGif,
        })}
        onClick={() =>
          handleRecOptsChange({
            ...recOpts,
            enableOutputAsGif: false,
          })
        }
      >
        MP4
      </button>
      <button
        type="button"
        title="Output as GIF"
        className={classNames(styles.btnOutputGif, {
          [styles.toggled]: recOpts.enableOutputAsGif,
        })}
        onClick={() =>
          handleRecOptsChange({
            ...recOpts,
            enableOutputAsGif: true,
          })
        }
      >
        GIF
      </button>
      <div className={styles.divider} />
      <button
        type="button"
        title="Close"
        className={styles.close}
        onClick={onCaptureCancel}
      >
        <img src={closeIcon} />
      </button>
    </div>
  );
};
