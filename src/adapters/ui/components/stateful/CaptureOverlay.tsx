/* eslint-disable @typescript-eslint/no-explicit-any */

import classNames from 'classnames';
import React, { useCallback, useEffect, useState, useRef } from 'react';

import { emptyBounds, getIntersection, isEmptyBounds } from '@utils/bounds';

import { CaptureOptions, RecordOptions } from '@domain/models/capture';
import { CaptureMode } from '@domain/models/common';
import { Bounds, Point } from '@domain/models/screen';

import CaptureControl from '@adapters/ui/components/stateless/CaptureControl';
import CaptureCountdown from '@adapters/ui/components/stateless/CaptureCountdown';
import CaptureRecording from '@adapters/ui/components/stateless/CaptureRecording';
import CaptureTargetingArea from '@adapters/ui/components/stateless/CaptureTargetingArea';
import CaptureTargetingScreen from '@adapters/ui/components/stateless/CaptureTargetingScreen';
import { useActionDispatcher } from '@adapters/ui/hooks/dispatcher';
import { useRootUiState } from '@adapters/ui/hooks/state';

import styles from './CaptureOverlay.css';

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

function CaptureOverlay(props: PropTypes) {
  const { assignedScreenId } = props;

  const dispatcher = useActionDispatcher();

  const { controlPanel, captureOverlay, captureAreaColors } = useRootUiState();
  const assignedScreen = captureOverlay.screens[assignedScreenId.toString()];
  const screenBounds = assignedScreen?.bounds;

  const [renderMode, setRenderMode] = useState<RenderMode>(RenderMode.IDLE);
  const [countdown, setCountdown] = useState<number>(0);
  const countdownTimer = useRef<ReturnType<typeof setInterval>>();

  const getTargetBoundsForUI = (): Bounds => {
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

    return {
      ...intersected,
      x: intersected.x - screenBounds.x,
      y: intersected.y - screenBounds.y,
    };
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

  const onSelectionStart = useCallback((cursorPosition: Point) => {
    dispatcher.startTargetSelection(emptyBounds(), cursorPosition);
  }, []);

  const onSelectingTarget = useCallback(
    (bounds: Bounds, cursorPosition: Point) => {
      dispatcher.selectingTarget(bounds, cursorPosition);
    },
    []
  );

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

  const composeOptions = useCallback(
    (mode?: CaptureMode, recOpts?: RecordOptions): CaptureOptions => {
      return {
        target: {
          mode: mode ?? controlPanel.captureMode,
        },
        recordOptions: {
          outputAsGif: recOpts?.outputAsGif ?? controlPanel.outputAsGif,
          recordAudio: recOpts?.recordAudio ?? controlPanel.recordAudio,
          audioSources: recOpts?.audioSources ?? controlPanel.audioSources,
        },
      };
    },
    [controlPanel]
  );

  const onCaptureModeChange = useCallback(
    (mode: CaptureMode) => {
      dispatcher.changeCaptureOptions(composeOptions(mode));
    },
    [controlPanel]
  );

  const onRecOptionsChange = useCallback(
    (recOpts: RecordOptions) => {
      dispatcher.changeCaptureOptions(composeOptions(undefined, recOpts));
    },
    [controlPanel]
  );

  useEffect(() => {
    if (!captureOverlay.show) {
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
      onSelectionStart({ x: 0, y: 0 });
      onSelectionFinish(screenBounds);
    }
  }, [
    controlPanel.confirmedToCaptureAsIs,
    controlPanel.captureMode,
    captureOverlay.selectedScreenId,
    captureOverlay.selectedBounds,
  ]);

  useEffect(() => {
    if (renderMode === RenderMode.IDLE || renderMode === RenderMode.TARGETING) {
      stopCountdown();
    }
  }, [renderMode]);

  return (
    <div
      className={classNames(styles.cover, {
        [styles.cursorCaptureArea]:
          controlPanel.captureMode === CaptureMode.AREA,
        [styles.cursorCaptureScreen]:
          controlPanel.captureMode === CaptureMode.SCREEN,
      })}
    >
      {renderMode !== RenderMode.IDLE && (
        <>
          {renderMode === RenderMode.TARGETING &&
            controlPanel.captureMode === CaptureMode.AREA && (
              <CaptureTargetingArea
                targetBounds={getTargetBoundsForUI()}
                screenBounds={screenBounds}
                startCursorPosition={captureOverlay.startCursorPosition}
                curCursorPosition={captureOverlay.curCursorPosition}
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
                targetBounds={getTargetBoundsForUI()}
                areaColors={captureAreaColors}
                onStart={onSelectionStart}
                onCancel={onCaptureCancel}
                onFinish={onSelectionFinish}
              />
            )}
          {renderMode === RenderMode.COUNTDOWN &&
            captureOverlay.isCountingDown &&
            captureOverlay.selectedBounds && (
              <CaptureCountdown
                targetBounds={getTargetBoundsForUI()}
                countdown={countdown}
                areaColors={captureAreaColors}
              />
            )}
          {renderMode === RenderMode.RECORDING &&
            captureOverlay.selectedBounds && (
              <CaptureRecording targetBounds={getTargetBoundsForUI()} />
            )}
        </>
      )}
      {assignedScreen?.isPrimary &&
        captureOverlay.show &&
        controlPanel.show && (
          <div className={styles.options}>
            <div className={styles.controlWrapper}>
              <CaptureControl
                captureMode={controlPanel.captureMode}
                recordOptions={{
                  outputAsGif: controlPanel.outputAsGif,
                  recordAudio: controlPanel.recordAudio,
                  audioSources: controlPanel.audioSources,
                }}
                onCaptureModeChange={onCaptureModeChange}
                onRecordOptionsChange={onRecOptionsChange}
                onCaptureCancel={onCaptureCancel}
              />
            </div>
          </div>
        )}
    </div>
  );
}

export default CaptureOverlay;
