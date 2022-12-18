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
import SwitchButton from '@adapters/ui/components/stateless/SwitchButton';

import fullscreenIcon from '@assets/fullscreen.png';
import micIcon from '@assets/mic.png';
import selectionIcon from '@assets/selection.png';

import styles from './CaptureControl.css';
import TogglableMultiSelect from './TogglableMultiSelect';

const buttonMinWidth = '40px';

const BUTTON_ITEMS_CAPT_MODES = [
  {
    value: CaptureMode.SCREEN,
    icon: fullscreenIcon,
    alt: `Record Screen (${shortcutForDisplay(SHORTCUT_CAPTURE_MODE_SCREEN)})`,
    minWidth: buttonMinWidth,
  },
  {
    value: CaptureMode.AREA,
    icon: selectionIcon,
    alt: `Record Selected Area (${shortcutForDisplay(
      SHORTCUT_CAPTURE_MODE_AREA
    )})`,
    minWidth: buttonMinWidth,
  },
];

const BUTTON_ITEMS_REC_OPTS = [
  {
    value: 'mp4' as OutputFormat,
    title: 'MP4',
    alt: `Output as MP4 (${shortcutForDisplay(SHORTCUT_OUTPUT_MP4)})`,
    minWidth: buttonMinWidth,
  },
  {
    value: 'gif' as OutputFormat,
    title: 'GIF',
    alt: `Output as GIF (${shortcutForDisplay(SHORTCUT_OUTPUT_GIF)})`,
    minWidth: buttonMinWidth,
  },
];

const BUTTON_AUDIO_TOGGLE = {
  icon: micIcon,
  alt: 'Select items',
  enabled: false,
};

const items = [
  { checked: false, title: 'System Audio' },
  { checked: true, title: 'System Microphone' },
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
      <div className={styles.btnGroup}>
        <SwitchButton
          activeItemIndex={BUTTON_ITEMS_CAPT_MODES.findIndex(
            (item) => item.value === captMode
          )}
          items={BUTTON_ITEMS_CAPT_MODES}
          onSelect={(index: number) => {
            handleCaptModeChange(BUTTON_ITEMS_CAPT_MODES[index].value);
          }}
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.btnGroup}>
        <SwitchButton
          activeItemIndex={BUTTON_ITEMS_REC_OPTS.findIndex((item) =>
            recOpts.enableOutputAsGif
              ? item.value === 'gif'
              : item.value === 'mp4'
          )}
          items={BUTTON_ITEMS_REC_OPTS}
          onSelect={(index: number) => {
            handleRecOptsChange({
              ...recOpts,
              enableOutputAsGif: BUTTON_ITEMS_REC_OPTS[index].value === 'gif',
            });
          }}
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.btnGroup}>
        <TogglableMultiSelect
          toggleButton={BUTTON_AUDIO_TOGGLE}
          items={items}
          onToggle={(enabled: boolean) => {}}
          onSelect={(indices: number[]) => {}}
        />
      </div>
      <div className={styles.divider} />
      <CloseButton onClick={onCaptureCancel} />
    </div>
  );
};

export default CaptureControl;
