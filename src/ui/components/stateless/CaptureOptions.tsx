/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { FC, useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';

import { CaptureMode } from '@core/entities/common';
import { IRecordOptions } from '@core/entities/capture';
import {
  shortcutForDisplay,
  SHORTCUT_CAPTURE_MODE_AREA,
  SHORTCUT_CAPTURE_MODE_SCREEN,
  SHORTCUT_OUTPUT_GIF,
  SHORTCUT_OUTPUT_MP4,
} from '@utils/shortcut';

import styles from '@ui/components/stateless/CaptureOptions.css';
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
        title={`Record Full Screen (${shortcutForDisplay(
          SHORTCUT_CAPTURE_MODE_SCREEN
        )})`}
        className={classNames(styles.btnToggleLeft, {
          [styles.toggled]: captMode === CaptureMode.SCREEN,
        })}
        onClick={() => handleCaptModeChange(CaptureMode.SCREEN)}
      >
        Full
      </button>
      <button
        type="button"
        title={`Record Selected Area (${shortcutForDisplay(
          SHORTCUT_CAPTURE_MODE_AREA
        )})`}
        className={classNames(styles.btnToggleRight, {
          [styles.toggled]: captMode === CaptureMode.AREA,
        })}
        onClick={() => handleCaptModeChange(CaptureMode.AREA)}
      >
        Selection
      </button>
      <div className={styles.divider} />
      <button
        type="button"
        title={`Output as MP4 (${shortcutForDisplay(SHORTCUT_OUTPUT_MP4)})`}
        className={classNames(styles.btnToggleLeft, {
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
        title={`Output as GIF (${shortcutForDisplay(SHORTCUT_OUTPUT_GIF)})`}
        className={classNames(styles.btnToggleRight, {
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
        className={styles.btnClose}
        onClick={onCaptureCancel}
      >
        <img src={closeIcon} />
      </button>
    </div>
  );
};
