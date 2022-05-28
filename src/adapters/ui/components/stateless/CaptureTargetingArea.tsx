/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import logger from 'electron-log';

import React, {
  FC,
  MutableRefObject,
  useRef,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import Color from 'color';

import { Bounds, Point } from '@domain/models/screen';

import { CaptureAreaColors } from '@application/models/ui';

import { isEmptyBounds, isCapturableBounds, emptyBounds } from '@utils/bounds';

import styles from '@adapters/ui/components/stateless/CaptureTargetingArea.css';

const COLOR_ALPHA_AREA = 0.2;
const COLOR_ALPHA_AREA_SHADOW = 1.0;
const COLOR_ALPHA_TEXT_SHADOW = 0.3;

interface AreaSelectionCtx {
  started: boolean;
  selected: boolean;
  startPt: Point;
  endPt: Point;
  cursorPt: Point;
  cursorScreenPt: Point;
}

const initialSelCtx: AreaSelectionCtx = {
  started: false,
  selected: false,
  startPt: { x: 0, y: 0 },
  endPt: { x: 0, y: 0 },
  cursorPt: { x: 0, y: 0 },
  cursorScreenPt: { x: 0, y: 0 },
};

const getMousePoint = (e: MouseEvent, screenBounds: Bounds): Point => {
  const x = Math.min(
    Math.max(e.screenX - screenBounds.x, 0),
    screenBounds.x + screenBounds.width
  );
  const y = Math.min(
    Math.max(e.screenY - screenBounds.y, 0),
    screenBounds.y + screenBounds.height
  );
  return { x, y };
};

const calcSelectedBounds = (selCtx: AreaSelectionCtx): Bounds => {
  const endX = selCtx.selected ? selCtx.endPt.x : selCtx.cursorPt.x;
  const endY = selCtx.selected ? selCtx.endPt.y : selCtx.cursorPt.y;
  return {
    x: Math.min(selCtx.startPt.x, endX),
    y: Math.min(selCtx.startPt.y, endY),
    width: Math.abs(endX - selCtx.startPt.x) + 1,
    height: Math.abs(endY - selCtx.startPt.y) + 1,
  };
};

const getAreaStyles = (
  selCtx: AreaSelectionCtx,
  bounds: Bounds,
  colors: CaptureAreaColors
): any => {
  const layoutStyle = {
    left: bounds.x - 1,
    top: bounds.y - 1,
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
        backgroundColor: color.alpha(COLOR_ALPHA_AREA).string(),
        boxShadow: `inset 0 0 1px ${color
          .alpha(COLOR_ALPHA_AREA_SHADOW)
          .string()}`,
      };
    }
    return {
      ...layoutStyle,
      backgroundColor: '#ff00001a',
      boxShadow: 'inset 0 0 1px #ff0000',
    };
  }

  return layoutStyle;
};

const CURSOR_HINT_BOX_SIZE = { width: 60, height: 10 };
const CURSOR_HINT_BOX_PAD = 4;
const getCursorHintStyles = (
  selCtx: AreaSelectionCtx,
  bounds: Bounds,
  colors: CaptureAreaColors
): any => {
  const colorStyle = {
    color: colors.selectingText,
    textShadow: `${Color(colors.selectingBackground)
      .alpha(COLOR_ALPHA_TEXT_SHADOW)
      .string()} 0px 0px 1px`,
  };

  if (!selCtx.started || !isCapturableBounds(bounds)) {
    return {
      display: 'none',
    };
  }

  const { startPt, cursorPt: curPt } = selCtx;
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

const handleMouseDown = (
  e: MouseEvent,
  screenBounds: Bounds,
  getCursorPoint: () => Point,
  onStart: () => void,
  onCancel: () => void,
  selCtxRef: MutableRefObject<AreaSelectionCtx>
) => {
  const selCtx = selCtxRef.current;

  // if click after already area settled or right click while selecting
  if (selCtx.selected || e.button === 2) {
    selCtxRef.current = initialSelCtx;
    onCancel();
    return;
  }

  const mousePt = getMousePoint(e, screenBounds);
  const cursorPt = getCursorPoint();
  selCtxRef.current = {
    ...selCtx,
    started: true,
    startPt: mousePt,
    cursorPt: mousePt,
    cursorScreenPt: cursorPt,
  };

  onStart();
};

const handleMouseUp = (
  e: MouseEvent,
  screenBounds: Bounds,
  getCursorPoint: () => Point,
  onCancel: () => void,
  onFinish: (boundsForUi: Bounds, boundsForCapture: Bounds) => void,
  selCtxRef: MutableRefObject<AreaSelectionCtx>
) => {
  const selCtx = selCtxRef.current;

  // if click after already area settled or right click while selecting
  if (!selCtx.started || selCtx.selected || e.button === 2) {
    selCtxRef.current = initialSelCtx;
    onCancel();
    return;
  }

  const mousePt = getMousePoint(e, screenBounds);
  const updatedSelCtx = { ...selCtx, endPt: mousePt, curPt: mousePt };
  const boundsForUi = calcSelectedBounds(updatedSelCtx);
  if (selCtx.started && !isCapturableBounds(boundsForUi)) {
    selCtxRef.current = initialSelCtx;
    onCancel();
    return;
  }

  updatedSelCtx.selected = true;
  selCtxRef.current = updatedSelCtx;

  const settledCursorPt = getCursorPoint();
  const boundsForCapture = {
    x: Math.min(updatedSelCtx.cursorScreenPt.x, settledCursorPt.x),
    y: Math.min(updatedSelCtx.cursorScreenPt.y, settledCursorPt.y),
    width: Math.abs(settledCursorPt.x - updatedSelCtx.cursorScreenPt.x) + 1,
    height: Math.abs(settledCursorPt.y - updatedSelCtx.cursorScreenPt.y) + 1,
  };
  onFinish(boundsForUi, boundsForCapture);
};

const handleMouseMove = (
  e: MouseEvent,
  screenBounds: Bounds,
  selCtxRef: MutableRefObject<AreaSelectionCtx>
) => {
  const selCtx = selCtxRef.current;

  if (!selCtx.started) {
    return;
  }

  const mousePt = getMousePoint(e, screenBounds);
  selCtxRef.current = { ...selCtx, cursorPt: mousePt };
};

interface PropTypes {
  // screenBounds: Bounds;
  areaColors: CaptureAreaColors;
  onStart: () => void;
  onCancel: () => void;
  onFinish: (boundsForUi: Bounds, boundsForCapture: Bounds) => void;
  getCursorPoint: () => Point;
}

const CaptureTargetingArea: FC<PropTypes> = (props: PropTypes) => {
  const {
    // screenBounds,
    areaColors,
    onStart,
    onFinish,
    onCancel,
    getCursorPoint,
  } = props;

  const screenBounds = { x: 0, y: 0, width: 2560, height: 1600 };

  const [selBounds, updateSelBounds] = useState<Bounds>(emptyBounds());
  const selCtxRef = useRef<AreaSelectionCtx>(initialSelCtx);

  useEffect(() => {
    const mouseDownHandler = (e: MouseEvent): void => {
      handleMouseDown(
        e,
        screenBounds,
        getCursorPoint,
        onStart,
        onCancel,
        selCtxRef
      );
      updateSelBounds(calcSelectedBounds(selCtxRef.current));
    };

    const mouseUpHandler = (e: MouseEvent): void => {
      handleMouseUp(
        e,
        screenBounds,
        getCursorPoint,
        onCancel,
        onFinish,
        selCtxRef
      );
      updateSelBounds(calcSelectedBounds(selCtxRef.current));
    };

    const mouseMoveHandler = (e: MouseEvent): void => {
      const pt = getCursorPoint();
      logger.info(`${e.screenX}x${e.screenY}, ${pt.x}x${pt.y}`);
      handleMouseMove(e, screenBounds, selCtxRef);
      updateSelBounds(calcSelectedBounds(selCtxRef.current));
    };

    document.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    document.addEventListener('mousemove', mouseMoveHandler);

    return () => {
      document.removeEventListener('mousedown', mouseDownHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, []);

  return (
    <div className={classNames(styles.wrapper, styles.cursorSelecting)}>
      <>
        <div
          className={classNames(styles.area, {
            [styles.areaHidden]:
              !selCtxRef.current.started || isEmptyBounds(selBounds),
          })}
          style={getAreaStyles(selCtxRef.current, selBounds, areaColors)}
        />
        {!selCtxRef.current.selected && (
          <div
            className={styles.cursorSizeHint}
            style={getCursorHintStyles(
              selCtxRef.current,
              selBounds,
              areaColors
            )}
          >
            {selBounds.width}x{selBounds.height}
          </div>
        )}
      </>
    </div>
  );
};

export default CaptureTargetingArea;
