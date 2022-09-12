/* eslint-disable react-hooks/exhaustive-deps */

import classNames from 'classnames';
import React, { useEffect, useState, useCallback, MouseEvent } from 'react';

import {
  shortcutForDisplay,
  SHORTCUT_CAPTURE_MODE_AREA,
  SHORTCUT_CAPTURE_MODE_SCREEN,
  SHORTCUT_OUTPUT_GIF,
  SHORTCUT_OUTPUT_MP4,
} from '@utils/shortcut';

import { RecordOptions } from '@domain/models/capture';
import { CaptureMode } from '@domain/models/common';

import closeIcon from '@assets/close.png';

import styles from './CaptureControl.css';

const withStopPropagation = (
  e: MouseEvent<HTMLButtonElement>,
  handler?: () => void
) => {
  e.stopPropagation();
  if (handler) {
    handler();
  }
  return false;
};

type Props = {
  captureMode: CaptureMode;
  recordOptions: RecordOptions;
  onCaptureModeChange: (mode: CaptureMode) => void;
  onRecordOptionsChange: (recOptions: RecordOptions) => void;
  onCaptureCancel: () => void;
};

const CaptureControl = ({
  captureMode,
  recordOptions,
  onCaptureModeChange,
  onRecordOptionsChange,
  onCaptureCancel,
}: Props) => {
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
        onClick={(e) =>
          withStopPropagation(e, () => handleCaptModeChange(CaptureMode.SCREEN))
        }
        onMouseUp={(e) => withStopPropagation(e)}
        onMouseDown={(e) => withStopPropagation(e)}
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
        onMouseUp={(e) => withStopPropagation(e)}
        onMouseDown={(e) => withStopPropagation(e)}
        onClick={(e) =>
          withStopPropagation(e, () => handleCaptModeChange(CaptureMode.AREA))
        }
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
        onMouseUp={(e) => withStopPropagation(e)}
        onMouseDown={(e) => withStopPropagation(e)}
        onClick={(e) =>
          withStopPropagation(e, () =>
            handleRecOptsChange({
              ...recOpts,
              enableOutputAsGif: false,
            })
          )
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
        onMouseUp={(e) => withStopPropagation(e)}
        onMouseDown={(e) => withStopPropagation(e)}
        onClick={(e) =>
          withStopPropagation(e, () =>
            handleRecOptsChange({
              ...recOpts,
              enableOutputAsGif: true,
            })
          )
        }
      >
        GIF
      </button>
      <div className={styles.divider} />
      <button
        type="button"
        title="Close"
        className={styles.btnClose}
        onMouseUp={(e) => withStopPropagation(e)}
        onMouseDown={(e) => withStopPropagation(e)}
        onClick={(e) => withStopPropagation(e, onCaptureCancel)}
      >
        <img src={closeIcon} alt="close" />
      </button>
    </div>
  );
};

export default CaptureControl;
