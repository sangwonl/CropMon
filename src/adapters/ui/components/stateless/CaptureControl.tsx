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
import { CaptureMode, OutputFormat } from '@domain/models/common';

import CloseButton from '@adapters/ui/components/stateless/CloseButton';
import ToggleButton from '@adapters/ui/components/stateless/ToggleButton';

import styles from './CaptureControl.css';

const TOGGLE_ITEMS_CAPT_MODES = [
  {
    value: CaptureMode.SCREEN,
    title: 'Screen',
    alt: `Record Screen (${shortcutForDisplay(SHORTCUT_CAPTURE_MODE_SCREEN)})`,
  },
  {
    value: CaptureMode.AREA,
    title: 'Selection',
    alt: `Record Selected Area (${shortcutForDisplay(
      SHORTCUT_CAPTURE_MODE_AREA
    )})`,
  },
];

const TOGGLE_ITEMS_REC_OPTS = [
  {
    value: 'mp4' as OutputFormat,
    title: 'MP4',
    alt: `Output as MP4 (${shortcutForDisplay(SHORTCUT_OUTPUT_MP4)})`,
  },
  {
    value: 'gif' as OutputFormat,
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
        activeItemIndex={TOGGLE_ITEMS_CAPT_MODES.findIndex(
          (item) => item.value === captMode
        )}
        items={TOGGLE_ITEMS_CAPT_MODES}
        onToggle={(index: number) => {
          handleCaptModeChange(TOGGLE_ITEMS_CAPT_MODES[index].value);
        }}
      />
      <div className={styles.divider} />
      <ToggleButton
        activeItemIndex={TOGGLE_ITEMS_REC_OPTS.findIndex((item) =>
          recOpts.enableOutputAsGif
            ? item.value === 'gif'
            : item.value === 'mp4'
        )}
        items={TOGGLE_ITEMS_REC_OPTS}
        onToggle={(index: number) => {
          handleRecOptsChange({
            ...recOpts,
            enableOutputAsGif: TOGGLE_ITEMS_REC_OPTS[index].value === 'gif',
          });
        }}
      />
      <div className={styles.divider} />
      <CloseButton onClick={onCaptureCancel} />
    </div>
  );
};

export default CaptureControl;
