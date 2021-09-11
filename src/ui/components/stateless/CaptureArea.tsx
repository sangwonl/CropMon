/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  MouseEvent,
  Dispatch,
  SetStateAction,
  FC,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import classNames from 'classnames';

import { IBounds, IPoint } from '@core/entities/screen';
import { SPARE_PIXELS, isEmptyBounds, isCapturableBounds } from '@utils/bounds';

import styles from './CaptureArea.css';

const DEFAULT_COUNTDOWN = 3;

interface IAreaSelectionCtx {
  started: boolean;
  selected: boolean;
  startPt: IPoint;
  endPt: IPoint;
  curPt: IPoint;
  curScreenPt: IPoint;
}

const initialSelCtx: IAreaSelectionCtx = {
  started: false,
  selected: false,
  startPt: { x: 0, y: 0 },
  endPt: { x: 0, y: 0 },
  curPt: { x: 0, y: 0 },
  curScreenPt: { x: 0, y: 0 },
};

const calcSelectedBounds = (selCtx: IAreaSelectionCtx): IBounds => {
  const endX = selCtx.selected ? selCtx.endPt.x : selCtx.curPt.x;
  const endY = selCtx.selected ? selCtx.endPt.y : selCtx.curPt.y;
  return {
    x: Math.min(selCtx.startPt.x, endX) - SPARE_PIXELS,
    y: Math.min(selCtx.startPt.y, endY) - SPARE_PIXELS,
    width: Math.abs(endX - selCtx.startPt.x) + 1,
    height: Math.abs(endY - selCtx.startPt.y) + 1,
  };
};

const getAreaClasses = (
  countdown: number,
  selCtx: IAreaSelectionCtx,
  bounds: IBounds
): string => {
  if (isEmptyBounds(bounds)) {
    return styles.areaHidden;
  }

  if (!isCapturableBounds(bounds)) {
    return classNames(styles.area, styles.areaUncapturable);
  }

  if (!selCtx.selected) {
    return classNames(styles.area, styles.areaSelecting);
  }

  if (countdown > 0) {
    return classNames(styles.area, styles.areaCountingDown);
  }

  if (countdown === 0) {
    return classNames(styles.area, styles.areaRecording);
  }

  return classNames(styles.area);
};

const getAreaLayout = (curBounds: IBounds): any => {
  return {
    left: curBounds.x + SPARE_PIXELS - 1,
    top: curBounds.y + SPARE_PIXELS - 1,
    width: curBounds.width + 2,
    height: curBounds.height + 2,
  };
};

const CURSOR_HINT_BOX_SIZE = { width: 60, height: 10 };
const CURSOR_HINT_BOX_PAD = 4;
const getCursorHintLayout = (selCtx: IAreaSelectionCtx): any => {
  const { startPt, curPt } = selCtx;

  if (curPt.x > startPt.x) {
    // right-bottom
    if (curPt.y > startPt.y) {
      return {
        ...CURSOR_HINT_BOX_SIZE,
        left: curPt.x - (CURSOR_HINT_BOX_SIZE.width + CURSOR_HINT_BOX_PAD),
        top: curPt.y - (CURSOR_HINT_BOX_SIZE.height + CURSOR_HINT_BOX_PAD),
        textAlign: 'right',
      };
    }

    // right-top
    return {
      ...CURSOR_HINT_BOX_SIZE,
      left: curPt.x - (CURSOR_HINT_BOX_SIZE.width + CURSOR_HINT_BOX_PAD),
      top: curPt.y + CURSOR_HINT_BOX_PAD,
      textAlign: 'right',
    };
  }

  // left-bottom
  if (curPt.y > startPt.y) {
    return {
      ...CURSOR_HINT_BOX_SIZE,
      left: curPt.x + CURSOR_HINT_BOX_PAD,
      top: curPt.y - (CURSOR_HINT_BOX_SIZE.height + CURSOR_HINT_BOX_PAD),
    };
  }

  // left-top
  return {
    ...CURSOR_HINT_BOX_SIZE,
    left: curPt.x + CURSOR_HINT_BOX_PAD,
    top: curPt.y + CURSOR_HINT_BOX_PAD,
  };
};

const getCountdownStyle = (bounds: IBounds) => {
  const { width, height } = bounds;
  if (width < 40 && height < 40) {
    return {
      fontSize: 16,
    };
  }
  if (width < 600 && height < 600) {
    return {
      fontSize: 40,
    };
  }
  return {
    fontSize: 80,
  };
};

const handleMouseDown = (
  e: MouseEvent<HTMLDivElement>,
  getCursorScreenPoint: () => IPoint,
  onSelectionStart: () => void,
  onSelectionCancel: () => void,
  selCtx: IAreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<IAreaSelectionCtx>>,
  countdown: number,
  isRecording: boolean
) => {
  if (countdown > 0 || isRecording) {
    return;
  }

  // if click after already area settled or right click while selecting
  if (selCtx.selected || e.button === 2) {
    setSelCtx(initialSelCtx);
    onSelectionCancel();
    return;
  }

  setSelCtx({
    ...selCtx,
    started: true,
    startPt: { x: e.clientX, y: e.clientY },
    curPt: { x: e.clientX, y: e.clientY },
    curScreenPt: getCursorScreenPoint(),
  });

  onSelectionStart();
};

const handleMouseUp = (
  e: MouseEvent<HTMLDivElement>,
  getCursorScreenPoint: () => IPoint,
  onSelectionCancel: () => void,
  onSelectionFinish: (bounds: IBounds) => void,
  selCtx: IAreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<IAreaSelectionCtx>>,
  countdown: number,
  isRecording: boolean
) => {
  if (countdown > 0 || isRecording) {
    return;
  }

  // if click after already area settled or right click while selecting
  if (!selCtx.started || selCtx.selected || e.button === 2) {
    setSelCtx(initialSelCtx);
    onSelectionCancel();
    return;
  }

  const updatedSelCtx = {
    ...selCtx,
    endPt: { x: e.clientX, y: e.clientY },
    curPt: { x: e.clientX, y: e.clientY },
  };

  const bounds = calcSelectedBounds(updatedSelCtx);
  if (selCtx.started && !isCapturableBounds(bounds)) {
    setSelCtx(initialSelCtx);
    onSelectionCancel();
    return;
  }

  updatedSelCtx.started = false;
  updatedSelCtx.selected = true;
  setSelCtx(updatedSelCtx);

  const curScreenPt = getCursorScreenPoint();
  onSelectionFinish({
    x: Math.min(updatedSelCtx.curScreenPt.x, curScreenPt.x),
    y: Math.min(updatedSelCtx.curScreenPt.y, curScreenPt.y),
    width: Math.abs(curScreenPt.x - updatedSelCtx.curScreenPt.x) + 1,
    height: Math.abs(curScreenPt.y - updatedSelCtx.curScreenPt.y) + 1,
  });
};

const handleMouseMove = (
  e: MouseEvent<HTMLDivElement>,
  selCtx: IAreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<IAreaSelectionCtx>>,
  countdown: number,
  isRecording: boolean
) => {
  if (countdown > 0 || isRecording || !selCtx.started) {
    return;
  }

  setSelCtx({
    ...selCtx,
    curPt: { x: e.clientX, y: e.clientY },
  });
};

interface PropTypes {
  active: boolean;
  isRecording: boolean;
  boundsSelected: boolean;
  getCursorScreenPoint: () => IPoint;
  onSelectionStart: () => void;
  onSelectionCancel: () => void;
  onSelectionFinish: (bounds: IBounds) => void;
  onRecordingStart: (bounds: IBounds) => void;
}

const CaptureArea: FC<PropTypes> = (props: PropTypes) => {
  const {
    active,
    isRecording,
    boundsSelected,
    getCursorScreenPoint: getCursorPt,
    onSelectionStart: onStart,
    onSelectionFinish: onFinish,
    onSelectionCancel: onCancel,
    onRecordingStart: onRecord,
  } = props;

  const [selCtx, setSelCtx] = useState<IAreaSelectionCtx>(initialSelCtx);
  const [countdown, setCountdown] = useState<number>(0);
  const countdownRef = useRef<number>(0);
  const countdownTimer = useRef<any>();

  const onSelFinish = useCallback(
    (bounds: IBounds) => {
      onFinish(bounds);

      // HINT: if we need to switch to non-countdown mode
      // onRecord(bounds);
      // return;

      let cnt = DEFAULT_COUNTDOWN;
      setCountdown(cnt);
      countdownRef.current = cnt;

      countdownTimer.current = setInterval(() => {
        cnt -= 1;
        setCountdown(cnt);
        countdownRef.current = cnt;

        if (cnt <= 0) {
          clearInterval(countdownTimer.current);
          onRecord(bounds);
        }
      }, 1000);
    },
    [onFinish, onRecord, setCountdown]
  );

  useEffect(() => {
    if (!boundsSelected) {
      setSelCtx(initialSelCtx);
    } else {
      setSelCtx({
        ...selCtx,
        selected: boundsSelected,
      });
    }
  }, [boundsSelected]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        if (countdownRef.current <= 0 || isRecording) {
          return;
        }

        setCountdown(0);
        countdownRef.current = 0;
        clearInterval(countdownTimer.current);

        setSelCtx(initialSelCtx);
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isRecording, onCancel]);

  const calcBounds = calcSelectedBounds(selCtx);

  return (
    <div
      className={classNames({
        [styles.wrapper]: true,
        [styles.wrapperHack]: !selCtx.selected,
        [styles.cursorSelecting]: !selCtx.selected,
      })}
      onMouseDown={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseDown(
          e,
          getCursorPt,
          onStart,
          onCancel,
          selCtx,
          setSelCtx,
          countdown,
          isRecording
        )
      }
      onMouseUp={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseUp(
          e,
          getCursorPt,
          onCancel,
          onSelFinish,
          selCtx,
          setSelCtx,
          countdown,
          isRecording
        )
      }
      onMouseMove={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseMove(e, selCtx, setSelCtx, countdown, isRecording)
      }
    >
      {active && (
        <>
          <div
            className={getAreaClasses(countdown, selCtx, calcBounds)}
            style={getAreaLayout(calcBounds)}
          >
            {countdown > 0 && (
              <div
                className={styles.countdownText}
                style={getCountdownStyle(calcBounds)}
              >
                {countdown}
              </div>
            )}
          </div>
          {!selCtx.selected && (
            <div
              className={styles.cursorSizeHint}
              style={getCursorHintLayout(selCtx)}
            >
              {calcBounds.width}x{calcBounds.height}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CaptureArea;
