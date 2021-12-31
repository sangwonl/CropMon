/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import classNames from 'classnames';

import { CaptureMode } from '@core/entities/common';
import { IBounds } from '@core/entities/screen';
import CaptureTargetingArea from '@ui/components/stateless/CaptureTargetingArea';
import CaptureTargetingScreen from '@ui/components/stateless/CaptureTargetingScreen';
import CaptureCountdown from '@ui/components/stateless/CaptureCountdown';
import CaptureRecording from '@ui/components/stateless/CaptureRecording';
import { useRootUiState } from '@ui/hooks/state';
import { useActionDispatcher } from '@ui/hooks/dispatcher';
import { useRemote } from '@ui/hooks/remote';
import { getBoundsFromZero, isEmptyBounds } from '@utils/bounds';
import { isMac } from '@utils/process';

import styles from '@ui/components/stateful/CaptureOverlay.css';

const DEFAULT_COUNTDOWN = 3;

enum RenderMode {
  IDLE = 0,
  TARGETING,
  COUNTDOWN,
  RECORDING,
}

const stretchBodySize = (w: number, h: number) => {
  document.body.style.width = `${w}px`;
  document.body.style.height = `${h}px`;
};

const adjustBodySize = (overlayBounds: IBounds | null) => {
  if (overlayBounds === null) {
    return;
  }
  stretchBodySize(overlayBounds.width, overlayBounds.height);
};

const CaptureCover = () => {
  const { controlPanel, captureOverlay, captureAreaColors } = useRootUiState();
  const dispatcher = useActionDispatcher();
  const remote = useRemote();

  const [renderMode, setRenderMode] = useState<RenderMode>(RenderMode.IDLE);
  const [selectedBounds, setSelectedBounds] = useState<IBounds | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const countdownTimer = useRef<any>();

  const changeRenderMode = (mode: RenderMode) => {
    if (renderMode !== mode) {
      setRenderMode(mode);
    }
  };

  const startCountdown = (onDone: () => void) => {
    if (!captureOverlay.showCountdown) {
      onDone();
      return;
    }

    // start counting down before recording
    let cnt = DEFAULT_COUNTDOWN;
    setCountdown(cnt);

    countdownTimer.current = setInterval(() => {
      cnt -= 1;
      setCountdown(cnt);

      if (cnt <= 0) {
        clearInterval(countdownTimer.current);
        onDone();
      }
    }, 1000);
  };

  const stopCountdown = () => {
    clearInterval(countdownTimer.current);
    setCountdown(0);
  };

  const onSelectionStart = useCallback(() => {
    dispatcher.startTargetSelection();
  }, []);

  const onSelectionFinish = useCallback(
    (boundsForUi: IBounds, boundsForCapture: IBounds) => {
      setSelectedBounds(boundsForUi);

      dispatcher.finishTargetSelection(boundsForCapture);

      startCountdown(() => dispatcher.startCapture());
    },
    [controlPanel.captureMode, captureOverlay.showCountdown]
  );

  const onCaptureCancel = useCallback(() => {
    dispatcher.disableCaptureMode();
  }, []);

  useEffect(() => {
    if (captureOverlay.show && captureOverlay.bounds) {
      adjustBodySize(captureOverlay.bounds);
    } else {
      stopCountdown();
      changeRenderMode(RenderMode.IDLE);
      setSelectedBounds(null);
    }
  }, [captureOverlay.show, captureOverlay.bounds]);

  useEffect(() => {
    if (!captureOverlay.show) {
      return;
    }

    if (isEmptyBounds(selectedBounds)) {
      changeRenderMode(RenderMode.TARGETING);
    } else if (countdown > 0) {
      changeRenderMode(RenderMode.COUNTDOWN);
    } else {
      changeRenderMode(RenderMode.RECORDING);
    }
  }, [captureOverlay.show, selectedBounds, countdown]);

  useEffect(() => {
    if (
      isEmptyBounds(selectedBounds) &&
      controlPanel.captureMode === CaptureMode.SCREEN &&
      controlPanel.confirmedToCaptureAsIs &&
      captureOverlay.bounds
    ) {
      onSelectionStart();
      onSelectionFinish(
        getBoundsFromZero(captureOverlay.bounds),
        captureOverlay.bounds
      );
    }
  }, [
    selectedBounds,
    controlPanel.captureMode,
    controlPanel.confirmedToCaptureAsIs,
    captureOverlay.bounds,
  ]);

  return renderMode !== RenderMode.IDLE ? (
    <div
      className={classNames(styles.cover, {
        [styles.coverHack]: isMac(),
      })}
    >
      {renderMode === RenderMode.TARGETING &&
        controlPanel.captureMode === CaptureMode.AREA && (
          <CaptureTargetingArea
            areaColors={captureAreaColors}
            onStart={onSelectionStart}
            onCancel={onCaptureCancel}
            onFinish={onSelectionFinish}
            getCursorPoint={remote.getCursorScreenPoint}
          />
        )}
      {renderMode === RenderMode.TARGETING &&
        controlPanel.captureMode === CaptureMode.SCREEN &&
        captureOverlay.bounds && (
          <CaptureTargetingScreen
            areaColors={captureAreaColors}
            screenBounds={captureOverlay.bounds}
            onStart={onSelectionStart}
            onCancel={onCaptureCancel}
            onFinish={onSelectionFinish}
          />
        )}
      {renderMode === RenderMode.COUNTDOWN &&
        countdown > 0 &&
        selectedBounds && (
          <CaptureCountdown
            selectedBounds={selectedBounds}
            countdown={countdown}
            areaColors={captureAreaColors}
          />
        )}
      {renderMode === RenderMode.RECORDING && selectedBounds && (
        <CaptureRecording selectedBounds={selectedBounds} />
      )}
    </div>
  ) : null;
};

export default CaptureCover;
