/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback } from 'react';

import { CaptureMode } from '@core/entities/common';
import { IRecordOptions } from '@core/entities/capture';

import { CaptureOptions } from '@ui/components/stateless/CaptureOptions';
import { useActionDispatcher } from '@ui/hooks/dispatcher';
import { useRootUiState } from '@ui/hooks/state';

import styles from '@ui/components/stateful/ControlPanel.css';

const ControlPanel = () => {
  const dispatcher = useActionDispatcher();

  const { controlPanel } = useRootUiState();

  const composeOptions = useCallback(
    (mode?: CaptureMode, recOpts?: IRecordOptions) => {
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
    (recOpts: IRecordOptions) => {
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
