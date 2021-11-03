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
import Color from 'color';

import { IBounds, IPoint } from '@core/entities/screen';
import { ICaptureAreaColors } from '@core/entities/ui';
import { useStateWithGetter } from '@ui/hooks/state';
import { SPARE_PIXELS, isEmptyBounds, isCapturableBounds } from '@utils/bounds';

import styles from './CaptureArea.css';

const DEFAULT_COUNTDOWN = 3;
const COUNTDOWN_FONT_SMALL = 16;
const COUNTDOWN_FONT_MID = 50;
const COUNTDOWN_FONT_LARGE = 80;
const AREA_SIZE_SMALL = 40;
const AREA_SIZE_MID = 600;

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

const getAreaStyles = (
  countdown: number,
  selCtx: IAreaSelectionCtx,
  bounds: IBounds,
  colors: ICaptureAreaColors
): any => {
  const layoutStyle = {
    left: bounds.x + SPARE_PIXELS - 1,
    top: bounds.y + SPARE_PIXELS - 1,
    width: bounds.width + 2,
    height: bounds.height + 2,
  };

  if (!selCtx.started || isEmptyBounds(bounds)) {
    return layoutStyle;
  }

  if (!selCtx.selected) {
    if (isCapturableBounds(bounds)) {
      const color = Color(colors.selectingBackground);
      return {
        ...layoutStyle,
        backgroundColor: color.string(),
        boxShadow: `inset 0 0 1px ${color.alpha(1.0).string()}`,
      };
    }
    return {
      ...layoutStyle,
      backgroundColor: '#ff00001a',
      boxShadow: 'inset 0 0 1px #ff0000',
    };
  }

  if (countdown > 0) {
    const color = Color(colors.countdownBackground);
    return {
      ...layoutStyle,
      backgroundColor: color.string(),
      boxShadow: `inset 0 0 1px ${color.alpha(1.0).string()}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };
  }

  if (countdown === 0) {
    return {
      ...layoutStyle,
      backgroundColor: 'transparent',
      outline: '1px solid rgba(255, 0, 0, 1.0)',
      animation: 'recordingBorder 2s infinite',
    };
  }

  return layoutStyle;
};

const CURSOR_HINT_BOX_SIZE = { width: 60, height: 10 };
const CURSOR_HINT_BOX_PAD = 4;
const getCursorHintStyles = (
  selCtx: IAreaSelectionCtx,
  bounds: IBounds,
  colors: ICaptureAreaColors
): any => {
  const colorStyle = {
    color: colors.selectingText,
    textShadow: `${Color(colors.selectingBackground)
      .alpha(0.5)
      .string()} 0px 0px 1px`,
  };

  if (!selCtx.started || !isCapturableBounds(bounds)) {
    return {
      display: 'none',
    };
  }

  const { startPt, curPt } = selCtx;
  if (curPt.x > startPt.x) {
    // right-bottom
    if (curPt.y > startPt.y) {
      return {
        ...CURSOR_HINT_BOX_SIZE,
        ...colorStyle,
        left: curPt.x - (CURSOR_HINT_BOX_SIZE.width + CURSOR_HINT_BOX_PAD),
        top: curPt.y - (CURSOR_HINT_BOX_SIZE.height + CURSOR_HINT_BOX_PAD),
        textAlign: 'right',
      };
    }

    // right-top
    return {
      ...CURSOR_HINT_BOX_SIZE,
      ...colorStyle,
      left: curPt.x - (CURSOR_HINT_BOX_SIZE.width + CURSOR_HINT_BOX_PAD),
      top: curPt.y + CURSOR_HINT_BOX_PAD,
      textAlign: 'right',
    };
  }

  // left-bottom
  if (curPt.y > startPt.y) {
    return {
      ...CURSOR_HINT_BOX_SIZE,
      ...colorStyle,
      left: curPt.x + CURSOR_HINT_BOX_PAD,
      top: curPt.y - (CURSOR_HINT_BOX_SIZE.height + CURSOR_HINT_BOX_PAD),
    };
  }

  // left-top
  return {
    ...CURSOR_HINT_BOX_SIZE,
    ...colorStyle,
    left: curPt.x + CURSOR_HINT_BOX_PAD,
    top: curPt.y + CURSOR_HINT_BOX_PAD,
  };
};

const getCountdownStyles = (bounds: IBounds, colors: ICaptureAreaColors) => {
  const colorStyle = {
    color: colors.countdownText,
    textShadow: `${Color(colors.countdownBackground)
      .alpha(0.5)
      .string()} 1px 2px 2px`,
  };

  const { width, height } = bounds;
  if (width < AREA_SIZE_SMALL && height < AREA_SIZE_SMALL) {
    return {
      ...colorStyle,
      fontSize: COUNTDOWN_FONT_SMALL,
    };
  }
  if (width < AREA_SIZE_MID && height < AREA_SIZE_MID) {
    return {
      ...colorStyle,
      fontSize: COUNTDOWN_FONT_MID,
    };
  }
  return {
    ...colorStyle,
    fontSize: COUNTDOWN_FONT_LARGE,
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
  showCountdown: boolean;
  areaColors: ICaptureAreaColors;
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
    showCountdown,
    areaColors,
    getCursorScreenPoint: getCursorPt,
    onSelectionStart: onStart,
    onSelectionFinish: onFinish,
    onSelectionCancel: onCancel,
    onRecordingStart: onRecord,
  } = props;

  const [selCtx, setSelCtx] = useState<IAreaSelectionCtx>(initialSelCtx);
  const [countdown, getCountdown, setCountdown] = useStateWithGetter<number>(0);
  const countdownTimer = useRef<any>();

  const onSelFinish = useCallback(
    (bounds: IBounds) => {
      onFinish(bounds);

      // start recording immediately if no countdown
      if (!showCountdown) {
        onRecord(bounds);
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
          onRecord(bounds);
        }
      }, 1000);
    },
    [showCountdown]
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
        if ((selCtx.selected && getCountdown() <= 0) || isRecording) {
          return;
        }

        setCountdown(0);
        clearInterval(countdownTimer.current);

        setSelCtx(initialSelCtx);
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selCtx.selected, isRecording]);

  const calcBounds = calcSelectedBounds(selCtx);

  return (
    <div
      className={classNames({
        [styles.wrapper]: true,
        [styles.wrapperHack]: !selCtx.selected || countdown > 0,
        [styles.cursorSelecting]: active && !selCtx.selected,
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
            className={classNames(styles.area, {
              [styles.areaHidden]: !selCtx.started || isEmptyBounds(calcBounds),
            })}
            style={getAreaStyles(countdown, selCtx, calcBounds, areaColors)}
          >
            {countdown > 0 && (
              <div
                className={styles.countdownText}
                style={getCountdownStyles(calcBounds, areaColors)}
              >
                {countdown}
              </div>
            )}
          </div>
          {!selCtx.selected && (
            <div
              className={styles.cursorSizeHint}
              style={getCursorHintStyles(selCtx, calcBounds, areaColors)}
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
