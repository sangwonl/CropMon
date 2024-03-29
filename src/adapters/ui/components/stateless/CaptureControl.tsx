import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ComponentProps,
} from 'react';

import { withStopPropagation } from '@utils/events';
import {
  shortcutForDisplay,
  SHORTCUT_CAPTURE_MODE_AREA,
  SHORTCUT_CAPTURE_MODE_SCREEN,
  SHORTCUT_OUTPUT_MP4,
  SHORTCUT_OUTPUT_WEBM,
  SHORTCUT_OUTPUT_GIF,
} from '@utils/shortcut';

import type { RecordOptions } from '@domain/models/capture';
import { CaptureMode, OutputFormat } from '@domain/models/common';

import { CloseButton } from '@adapters/ui/components/stateless/CloseButton';
import { SwitchButton } from '@adapters/ui/components/stateless/SwitchButton';
import { TogglableSelect } from '@adapters/ui/components/stateless/TogglableSelect';

import fullscreenIcon from '@assets/fullscreen.png';
import micIcon from '@assets/mic.png';
import selectionIcon from '@assets/selection.png';

import styles from './CaptureControl.css';

const BUTTON_ITEMS_CAPT_MODES = [
  {
    value: CaptureMode.SCREEN as string,
    icon: fullscreenIcon,
    alt: `Record Screen (${shortcutForDisplay(SHORTCUT_CAPTURE_MODE_SCREEN)})`,
  },
  {
    value: CaptureMode.AREA as string,
    icon: selectionIcon,
    alt: `Record Selected Area (${shortcutForDisplay(
      SHORTCUT_CAPTURE_MODE_AREA,
    )})`,
  },
];

const BUTTON_ITEMS_REC_OPTS = [
  {
    value: 'mp4', // as OutputFormat,
    title: 'MP4',
    alt: `Output as MP4 (${shortcutForDisplay(SHORTCUT_OUTPUT_MP4)})`,
  },
  {
    value: 'webm', // as OutputFormat,
    title: 'WebM',
    alt: `Output as WebM (${shortcutForDisplay(SHORTCUT_OUTPUT_WEBM)})`,
  },
  {
    value: 'gif', // as OutputFormat,
    title: 'GIF',
    alt: `Output as GIF (${shortcutForDisplay(SHORTCUT_OUTPUT_GIF)})`,
  },
];

const BUTTON_AUDIO_TOGGLE = {
  icon: micIcon,
  alt: 'Select items',
  enabled: false,
};

type Props = {
  captureMode: CaptureMode;
  recordOptions: RecordOptions;
  onCaptureModeChange: (mode: CaptureMode) => void;
  onRecordOptionsChange: (recOptions: RecordOptions) => void;
  onCaptureCancel: () => void;
};

export function CaptureControl({
  captureMode,
  recordOptions,
  onCaptureModeChange,
  onRecordOptionsChange,
  onCaptureCancel,
}: Props) {
  const [captMode, setCaptMode] = useState<CaptureMode>(captureMode);
  const [recOpts, setRecOpts] = useState<RecordOptions>(recordOptions);

  const audioItems: ComponentProps<typeof TogglableSelect>['items'] =
    useMemo(() => {
      const items = recOpts.audioSources.map(s => ({
        title: s.name,
        checked: s.active,
      }));

      if (items.length > 0 && !items.some(({ checked }) => checked)) {
        items[0].checked = true;
      }

      return items;
    }, [recOpts.audioSources]);

  const toggleAudioEnabled = useMemo(() => {
    return recOpts.outputFormat !== 'gif' && recOpts.audioSources.length > 0;
  }, [recOpts.outputFormat, recOpts.audioSources]);

  const handleCaptModeChange = useCallback(
    (mode: CaptureMode) => {
      setCaptMode(mode);
      onCaptureModeChange(mode);
    },
    [onCaptureModeChange],
  );

  const handleRecOptsChange = useCallback(
    (opts: RecordOptions) => {
      setRecOpts(opts);
      onRecordOptionsChange(opts);
    },
    [onRecordOptionsChange],
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
    <div
      className={styles.container}
      onMouseDown={withStopPropagation}
      onMouseUp={withStopPropagation}
    >
      <div className={styles.btnGroup}>
        <SwitchButton
          activeItemIndex={BUTTON_ITEMS_CAPT_MODES.findIndex(
            item => item.value === captMode,
          )}
          items={BUTTON_ITEMS_CAPT_MODES}
          onSelect={(index: number) => {
            handleCaptModeChange(
              BUTTON_ITEMS_CAPT_MODES[index].value as CaptureMode,
            );
          }}
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.btnGroup}>
        <SwitchButton
          activeItemIndex={BUTTON_ITEMS_REC_OPTS.findIndex(
            item => recOpts.outputFormat === (item.value as OutputFormat),
          )}
          items={BUTTON_ITEMS_REC_OPTS}
          onSelect={(index: number) => {
            handleRecOptsChange({
              ...recOpts,
              outputFormat: BUTTON_ITEMS_REC_OPTS[index].value as OutputFormat,
            });
          }}
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.btnGroup}>
        <TogglableSelect
          enabled={toggleAudioEnabled}
          toggleButton={{
            ...BUTTON_AUDIO_TOGGLE,
            active: recOpts.recordAudio,
          }}
          items={audioItems}
          onToggle={(enabled: boolean) => {
            handleRecOptsChange({
              ...recOpts,
              recordAudio: enabled,
            });
          }}
          onSelect={(indices: number[]) => {
            handleRecOptsChange({
              ...recOpts,
              audioSources: recOpts.audioSources.map((src, i) => ({
                ...src,
                active: indices.includes(i),
              })),
            });
          }}
        />
      </div>
      <div className={styles.divider} />
      <CloseButton onClick={onCaptureCancel} />
    </div>
  );
}
