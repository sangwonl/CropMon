/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import classNames from 'classnames';

import { CaptureMode } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';

import CaptureTargetingArea from '@adapters/ui/components/stateless/CaptureTargetingArea';
import CaptureTargetingScreen from '@adapters/ui/components/stateless/CaptureTargetingScreen';
import CaptureCountdown from '@adapters/ui/components/stateless/CaptureCountdown';
import CaptureRecording from '@adapters/ui/components/stateless/CaptureRecording';
import { useRootUiState } from '@adapters/ui/hooks/state';
import { useActionDispatcher } from '@adapters/ui/hooks/dispatcher';

import { emptyBounds, getIntersection, isEmptyBounds } from '@utils/bounds';
import { isMac } from '@utils/process';

import styles from '@adapters/ui/components/stateful/CaptureOverlay.css';

const DEFAULT_COUNTDOWN = 3;

enum RenderMode {
  IDLE = 0,
  TARGETING,
  COUNTDOWN,
  RECORDING,
}

interface PropTypes {
  assignedScreenId: number;
}

const CaptureOverlay = (props: PropTypes) => {
  const { assignedScreenId } = props;

  const dispatcher = useActionDispatcher();

  const { controlPanel, captureOverlay, captureAreaColors } = useRootUiState();
  const screenBounds = captureOverlay.screenBounds[assignedScreenId.toString()];

  const [renderMode, setRenderMode] = useState<RenderMode>(RenderMode.IDLE);
  const [countdown, setCountdown] = useState<number>(0);
  const countdownTimer = useRef<any>();

  const targetBounds = (): Bounds => {
    const selBounds =
      renderMode === RenderMode.TARGETING
        ? captureOverlay.selectingBounds
        : captureOverlay.selectedBounds;

    if (!selBounds) {
      return emptyBounds();
    }

    const intersected = getIntersection(selBounds, screenBounds);
    if (!intersected) {
      return emptyBounds();
    }

    return intersected;
  };

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
    dispatcher.startTargetSelection(emptyBounds());
  }, []);

  const onSelectingTarget = useCallback((bounds: Bounds) => {
    dispatcher.selectingTarget(bounds);
  }, []);

  const onSelectionFinish = useCallback(
    (bounds?: Bounds) => {
      dispatcher.finishTargetSelection(bounds ?? screenBounds);

      startCountdown(() => dispatcher.startCapture());
    },
    [controlPanel.captureMode, captureOverlay.showCountdown]
  );

  const onCaptureCancel = useCallback(() => {
    dispatcher.disableCaptureMode();
  }, []);

  useEffect(() => {
    if (!captureOverlay.show) {
      stopCountdown();
      changeRenderMode(RenderMode.IDLE);
    }
  }, [captureOverlay.show]);

  useEffect(() => {
    if (!captureOverlay.show) {
      return;
    }

    if (isEmptyBounds(captureOverlay.selectedBounds)) {
      changeRenderMode(RenderMode.TARGETING);
    } else if (captureOverlay.isCountingDown) {
      changeRenderMode(RenderMode.COUNTDOWN);
    } else {
      changeRenderMode(RenderMode.RECORDING);
    }
  }, [
    captureOverlay.show,
    captureOverlay.isCountingDown,
    captureOverlay.selectedBounds,
  ]);

  useEffect(() => {
    if (
      controlPanel.confirmedToCaptureAsIs &&
      controlPanel.captureMode === CaptureMode.SCREEN &&
      captureOverlay.selectedScreenId === assignedScreenId &&
      isEmptyBounds(captureOverlay.selectedBounds) &&
      screenBounds
    ) {
      onSelectionStart();
      onSelectionFinish(screenBounds);
    }
  }, [
    controlPanel.confirmedToCaptureAsIs,
    controlPanel.captureMode,
    captureOverlay.selectedScreenId,
    captureOverlay.selectedBounds,
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
            selectingBounds={targetBounds()}
            areaColors={captureAreaColors}
            onStart={onSelectionStart}
            onSelecting={onSelectingTarget}
            onCancel={onCaptureCancel}
            onFinish={onSelectionFinish}
          />
        )}
      {renderMode === RenderMode.TARGETING &&
        controlPanel.captureMode === CaptureMode.SCREEN &&
        screenBounds && (
          <CaptureTargetingScreen
            areaColors={captureAreaColors}
            screenBounds={targetBounds()}
            onStart={onSelectionStart}
            onCancel={onCaptureCancel}
            onFinish={onSelectionFinish}
          />
        )}
      {renderMode === RenderMode.COUNTDOWN &&
        captureOverlay.isCountingDown &&
        captureOverlay.selectedBounds && (
          <CaptureCountdown
            selectedBounds={targetBounds()}
            countdown={countdown}
            areaColors={captureAreaColors}
          />
        )}
      {renderMode === RenderMode.RECORDING && captureOverlay.selectedBounds && (
        <CaptureRecording selectedBounds={targetBounds()} />
      )}
    </div>
  ) : null;
};

export default CaptureOverlay;
