/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback } from 'react';

import { CaptureMode } from '@domain/models/common';
import { RecordOptions } from '@domain/models/capture';

import { CaptureOptions } from '@adapters/ui/components/stateless/CaptureOptions';
import { useActionDispatcher } from '@adapters/ui/hooks/dispatcher';
import { useRootUiState } from '@adapters/ui/hooks/state';

import styles from '@adapters/ui/components/stateful/ControlPanel.css';

const ControlPanel = () => {
  const dispatcher = useActionDispatcher();

  const { controlPanel } = useRootUiState();

  const composeOptions = useCallback(
    (mode?: CaptureMode, recOpts?: RecordOptions) => {
      return {
        target: {
          mode: mode ?? controlPanel.captureMode,
        },
        recordOptions: {
          enableOutputAsGif:
            recOpts?.enableOutputAsGif ?? controlPanel.outputAsGif,
          enableLowQualityMode:
            recOpts?.enableLowQualityMode ?? controlPanel.lowQualityMode,
          enableMicrophone:
            recOpts?.enableMicrophone ?? controlPanel.microphone,
        },
      };
    },
    [controlPanel]
  );

  const handleCaptureModeChange = useCallback(
    (mode: CaptureMode) => {
      dispatcher.changeCaptureOptions(composeOptions(mode));
    },
    [controlPanel]
  );

  const handleRecOptionsChange = useCallback(
    (recOpts: RecordOptions) => {
      dispatcher.changeCaptureOptions(composeOptions(undefined, recOpts));
    },
    [controlPanel]
  );

  const handleCaptureCancel = useCallback(() => {
    dispatcher.disableCaptureMode();
  }, []);

  return (
    <div className={styles.container}>
      <CaptureOptions
        captureMode={controlPanel.captureMode}
        recordOptions={{
          enableOutputAsGif: controlPanel.outputAsGif,
          enableLowQualityMode: controlPanel.lowQualityMode,
          enableMicrophone: controlPanel.microphone,
        }}
        onCaptureModeChange={handleCaptureModeChange}
        onRecordOptionsChange={handleRecOptionsChange}
        onCaptureCancel={handleCaptureCancel}
      />
    </div>
  );
};

export default ControlPanel;
