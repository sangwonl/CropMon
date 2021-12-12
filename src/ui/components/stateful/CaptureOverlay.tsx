/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CaptureMode } from '@core/entities/common';
import { IBounds } from '@core/entities/screen';
import {
  ICaptureAreaColors,
  ICaptureOverlay,
  IControlPanel,
} from '@core/entities/ui';
import { RootState } from '@ui/redux/store';
import {
  startTargetSelection,
  finishTargetSelection,
  disableCaptureMode,
  startCapture,
} from '@ui/redux/slice';
import CaptureTargetingArea from '@ui/components/stateless/CaptureTargetingArea';
import CaptureTargetingScreen from '@ui/components/stateless/CaptureTargetingScreen';
import CaptureCountdown from '@ui/components/stateless/CaptureCountdown';
import CaptureRecording from '@ui/components/stateless/CaptureRecording';
import { getCursorScreenPoint } from '@utils/remote';
import { emptyBounds, isEmptyBounds } from '@utils/bounds';

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
  const dispatch = useDispatch();

  const controlPanel: IControlPanel = useSelector(
    (state: RootState) => state.ui.root.controlPanel
  );

  const captureOverlay: ICaptureOverlay = useSelector(
    (state: RootState) => state.ui.root.captureOverlay
  );

  const captureAreaColors: ICaptureAreaColors = useSelector(
    (state: RootState) => state.ui.root.captureAreaColors
  );

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
    dispatch(startTargetSelection());
  }, []);

  const onSelectionFinish = useCallback(
    (boundsForUi: IBounds, boundsForCapture: IBounds) => {
      setSelectedBounds(boundsForUi);

      dispatch(finishTargetSelection(boundsForCapture));

      startCountdown(() => dispatch(startCapture()));
    },
    [controlPanel.captureMode]
  );

  const onCaptureCancel = useCallback(() => {
    stopCountdown();

    dispatch(disableCaptureMode());
  }, []);

  useEffect(() => {
    if (captureOverlay.show && captureOverlay.bounds) {
      adjustBodySize(captureOverlay.bounds);
      setSelectedBounds(emptyBounds());
    } else {
      changeRenderMode(RenderMode.IDLE);
      setSelectedBounds(null);
    }
  }, [captureOverlay.show]);

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

  return (
    <div className={styles.cover}>
      {renderMode === RenderMode.TARGETING &&
        controlPanel.captureMode === CaptureMode.AREA && (
          <CaptureTargetingArea
            areaColors={captureAreaColors}
            getCursorPoint={getCursorScreenPoint}
            onStart={onSelectionStart}
            onCancel={onCaptureCancel}
            onFinish={onSelectionFinish}
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
            onCancel={onCaptureCancel}
          />
        )}
      {renderMode === RenderMode.RECORDING && selectedBounds && (
        <CaptureRecording selectedBounds={selectedBounds} />
      )}
    </div>
  );
};

export default CaptureCover;