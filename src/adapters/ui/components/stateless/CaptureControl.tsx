/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState, useCallback } from 'react';

import {
  shortcutForDisplay,
  SHORTCUT_CAPTURE_MODE_AREA,
  SHORTCUT_CAPTURE_MODE_SCREEN,
  SHORTCUT_OUTPUT_GIF,
  SHORTCUT_OUTPUT_MP4,
} from '@utils/shortcut';

import { RecordOptions } from '@domain/models/capture';
import { CaptureMode } from '@domain/models/common';

import CloseButton from '@adapters/ui/components/stateless/CloseButton';
import ToggleButton from '@adapters/ui/components/stateless/ToggleButton';

import styles from './CaptureControl.css';

const CAPTURE_MODES = [CaptureMode.SCREEN, CaptureMode.AREA];
const TOGGLE_ITEMS_CAPT_MODES = [
  {
    title: 'Full Screen',
    alt: `Record Full Screen (${shortcutForDisplay(
      SHORTCUT_CAPTURE_MODE_SCREEN
    )})`,
  },
  {
    title: 'Selection',
    alt: `Record Selected Area (${shortcutForDisplay(
      SHORTCUT_CAPTURE_MODE_AREA
    )})`,
  },
];

const GIF_ENABLED = [false, true];
const TOGGLE_ITEMS_REC_OPTS = [
  {
    title: 'MP4',
    alt: `Output as MP4 (${shortcutForDisplay(SHORTCUT_OUTPUT_MP4)})`,
  },
  {
    title: 'GIF',
    alt: `Output as GIF (${shortcutForDisplay(SHORTCUT_OUTPUT_GIF)})`,
  },
];

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
      <ToggleButton
        activeItemIndex={CAPTURE_MODES.findIndex((mode) => mode === captMode)}
        items={TOGGLE_ITEMS_CAPT_MODES}
        onToggle={(index: number) => {
          handleCaptModeChange(CAPTURE_MODES[index]);
        }}
      />
      <div className={styles.divider} />
      <ToggleButton
        activeItemIndex={GIF_ENABLED.findIndex(
          (gif) => gif === recOpts.enableOutputAsGif
        )}
        items={TOGGLE_ITEMS_REC_OPTS}
        onToggle={(index: number) => {
          handleRecOptsChange({
            ...recOpts,
            enableOutputAsGif: GIF_ENABLED[index],
          });
        }}
      />
      <div className={styles.divider} />
      <CloseButton onClick={onCaptureCancel} />
    </div>
  );
};

export default CaptureControl;
