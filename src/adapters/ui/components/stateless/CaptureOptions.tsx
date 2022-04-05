/* eslint-disable react-hooks/exhaustive-deps */

import React, { FC, useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';

import { CaptureMode } from '@domain/models/common';
import { RecordOptions } from '@domain/models/capture';
import {
  shortcutForDisplay,
  SHORTCUT_CAPTURE_MODE_SCREEN,
  SHORTCUT_CAPTURE_MODE_WINDOW,
  SHORTCUT_CAPTURE_MODE_AREA,
  SHORTCUT_OUTPUT_GIF,
  SHORTCUT_OUTPUT_MP4,
} from '@utils/shortcut';

import styles from '@adapters/ui/components/stateless/CaptureOptions.css';
import closeIcon from '@assets/close.png';

export interface CaptureOptionsProps {
  captureMode: CaptureMode;
  recordOptions: RecordOptions;
  onCaptureModeChange: (mode: CaptureMode) => void;
  onRecordOptionsChange: (recOptions: RecordOptions) => void;
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
  const [recOpts, setRecOpts] = useState<RecordOptions>(recordOptions);

  const handleCaptModeChange = useCallback(
    (mode: CaptureMode) => {
      setCaptMode(mode);
      onCaptureModeChange(mode);
    },
    [onCaptureModeChange]
  );

  const handleRecOptsChange = useCallback(
    (opts: RecordOptions) => {
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
        title={`Record Selected Window (${shortcutForDisplay(
          SHORTCUT_CAPTURE_MODE_WINDOW
        )})`}
        className={classNames(styles.btnToggleMiddle, {
          [styles.toggled]: captMode === CaptureMode.WINDOW,
        })}
        onClick={() => handleCaptModeChange(CaptureMode.WINDOW)}
      >
        Window
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
        <img src={closeIcon} alt="close" />
      </button>
    </div>
  );
};
