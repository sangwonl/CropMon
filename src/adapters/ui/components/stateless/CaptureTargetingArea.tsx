/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */

import classNames from 'classnames';
import Color from 'color';
import React, { MutableRefObject, useRef, useEffect } from 'react';

import {
  emptyBounds,
  isEmptyBounds,
  isCapturableBounds,
  isPointInsideBounds,
} from '@utils/bounds';

import { Bounds, Point } from '@domain/models/screen';

import { CaptureAreaColors } from '@application/models/ui';

import styles from './CaptureTargetingArea.css';

const COLOR_ALPHA_AREA = 0.2;
const COLOR_ALPHA_AREA_SHADOW = 1.0;
const COLOR_ALPHA_TEXT_SHADOW = 0.3;

type AreaSelectionCtx = {
  started: boolean;
  selected: boolean;
  startPt: Point;
  endPt: Point;
  cursorPt: Point;
};

const initialSelCtx: AreaSelectionCtx = {
  started: false,
  selected: false,
  startPt: { x: 0, y: 0 },
  endPt: { x: 0, y: 0 },
  cursorPt: { x: 0, y: 0 },
};

const getMousePoint = (e: MouseEvent): Point => {
  return { x: e.screenX, y: e.screenY };
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

const getBoundsFromPoint = (startPt?: Point, curPt?: Point): Bounds => {
  if (!startPt || !curPt) {
    return emptyBounds();
  }

  return {
    x: Math.min(curPt.x, startPt.x),
    y: Math.min(curPt.y, startPt.y),
    width: Math.abs(curPt.x - startPt.x) + 1,
    height: Math.abs(curPt.y - startPt.y) + 1,
  };
};

const getAreaStyles = (
  selCtx: AreaSelectionCtx,
  bounds: Bounds,
  captureBounds: Bounds,
  colors: CaptureAreaColors
): any => {
  if (selCtx.selected || isEmptyBounds(bounds)) {
    return {
      display: 'none',
    };
  }

  const layoutStyle = {
    left: bounds.x - 1,
    top: bounds.y - 1,
    width: bounds.width + 2,
    height: bounds.height + 2,
  };

  if (!isCapturableBounds(captureBounds)) {
    return {
      ...layoutStyle,
      backgroundColor: '#ff00001a',
      boxShadow: 'inset 0 0 1px #ff0000',
    };
  }

  const color = Color(colors.selectingBackground);
  return {
    ...layoutStyle,
    backgroundColor: color.alpha(COLOR_ALPHA_AREA).string(),
    boxShadow: `inset 0 0 1px ${color.alpha(COLOR_ALPHA_AREA_SHADOW).string()}`,
  };
};

const CURSOR_HINT_BOX_SIZE = { width: 60, height: 10 };
const CURSOR_HINT_BOX_PAD = 4;
const getCursorHintStyles = (
  bounds: Bounds,
  screenBounds: Bounds,
  colors: CaptureAreaColors,
  startPt?: Point,
  curPt?: Point
): any => {
  if (
    !startPt ||
    !curPt ||
    !isCapturableBounds(getBoundsFromPoint(startPt, curPt)) ||
    !isPointInsideBounds(curPt, screenBounds)
  ) {
    return {
      display: 'none',
    };
  }

  const colorStyle = {
    color: colors.selectingText,
    textShadow: `${Color(colors.selectingBackground)
      .alpha(COLOR_ALPHA_TEXT_SHADOW)
      .string()} 0px 0px 1px`,
  };

  if (curPt.x > startPt.x) {
    // right-bottom
    if (curPt.y > startPt.y) {
      return {
        ...CURSOR_HINT_BOX_SIZE,
        ...colorStyle,
        left:
          bounds.x +
          bounds.width -
          (CURSOR_HINT_BOX_SIZE.width + CURSOR_HINT_BOX_PAD),
        top:
          bounds.y +
          bounds.height -
          (CURSOR_HINT_BOX_SIZE.height + CURSOR_HINT_BOX_PAD),
        textAlign: 'right',
      };
    }

    // right-top
    return {
      ...CURSOR_HINT_BOX_SIZE,
      ...colorStyle,
      left:
        bounds.x +
        bounds.width -
        (CURSOR_HINT_BOX_SIZE.width + CURSOR_HINT_BOX_PAD),
      top: bounds.y + CURSOR_HINT_BOX_PAD,
      textAlign: 'right',
    };
  }

  // left-bottom
  if (curPt.y > startPt.y) {
    return {
      ...CURSOR_HINT_BOX_SIZE,
      ...colorStyle,
      left: bounds.x + CURSOR_HINT_BOX_PAD,
      top:
        bounds.y +
        bounds.height -
        (CURSOR_HINT_BOX_SIZE.height + CURSOR_HINT_BOX_PAD),
    };
  }

  // left-top
  return {
    ...CURSOR_HINT_BOX_SIZE,
    ...colorStyle,
    left: bounds.x + CURSOR_HINT_BOX_PAD,
    top: bounds.y + CURSOR_HINT_BOX_PAD,
  };
};

const handleMouseDown = (
  e: MouseEvent,
  onStart: (cursorPosition: Point) => void,
  onSelecting: (bounds: Bounds, cursorPosition: Point) => void,
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

  const mousePt = getMousePoint(e);
  selCtxRef.current = {
    ...selCtx,
    started: true,
    startPt: mousePt,
    cursorPt: mousePt,
  };

  onStart(mousePt);

  onSelecting(calcSelectedBounds(selCtxRef.current), mousePt);
};

const handleMouseMove = (
  e: MouseEvent,
  onSelecting: (bounds: Bounds, cursorPosition: Point) => void,
  selCtxRef: MutableRefObject<AreaSelectionCtx>
) => {
  const selCtx = selCtxRef.current;

  if (!selCtx.started) {
    return;
  }

  const mousePt = getMousePoint(e);
  selCtxRef.current = { ...selCtx, cursorPt: mousePt };

  onSelecting(calcSelectedBounds(selCtxRef.current), mousePt);
};

const handleMouseUp = (
  e: MouseEvent,
  onSelecting: (bounds: Bounds, cursorPosition: Point) => void,
  onCancel: () => void,
  onFinish: (bounds: Bounds) => void,
  selCtxRef: MutableRefObject<AreaSelectionCtx>
) => {
  const selCtx = selCtxRef.current;

  // if click after already area settled or right click while selecting
  if (!selCtx.started || selCtx.selected || e.button === 2) {
    selCtxRef.current = initialSelCtx;
    onCancel();
    return;
  }

  const mousePt = getMousePoint(e);
  const updatedSelCtx = { ...selCtx, endPt: mousePt, curPt: mousePt };
  const bounds = calcSelectedBounds(updatedSelCtx);
  if (selCtx.started && !isCapturableBounds(bounds)) {
    selCtxRef.current = initialSelCtx;
    onCancel();
    return;
  }

  updatedSelCtx.selected = true;
  selCtxRef.current = updatedSelCtx;

  onSelecting(calcSelectedBounds(selCtxRef.current), mousePt);

  onFinish(bounds);
};

type Props = {
  targetBounds: Bounds;
  screenBounds: Bounds;
  startCursorPosition: Point | undefined;
  curCursorPosition: Point | undefined;
  areaColors: CaptureAreaColors;
  onStart: (cursorPosition: Point) => void;
  onSelecting: (bounds: Bounds, cursorPosition: Point) => void;
  onCancel: () => void;
  onFinish: (bounds: Bounds) => void;
};

function CaptureTargetingArea(props: Props) {
  const {
    targetBounds,
    screenBounds,
    startCursorPosition,
    curCursorPosition,
    areaColors,
    onStart,
    onSelecting,
    onFinish,
    onCancel,
  } = props;

  const selCtxRef = useRef<AreaSelectionCtx>(initialSelCtx);

  useEffect(() => {
    const mouseDownHandler = (e: MouseEvent): void => {
      handleMouseDown(e, onStart, onSelecting, onCancel, selCtxRef);
    };

    const mouseUpHandler = (e: MouseEvent): void => {
      handleMouseUp(e, onSelecting, onCancel, onFinish, selCtxRef);
    };

    const mouseMoveHandler = (e: MouseEvent): void => {
      handleMouseMove(e, onSelecting, selCtxRef);
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

  const entireCaptureBounds = getBoundsFromPoint(
    startCursorPosition,
    curCursorPosition
  );

  return (
    <>
      <div
        className={classNames(styles.area, {
          [styles.areaHidden]: isEmptyBounds(targetBounds),
        })}
        style={getAreaStyles(
          selCtxRef.current,
          targetBounds,
          entireCaptureBounds,
          areaColors
        )}
      />
      {!selCtxRef.current.selected && (
        <div
          className={styles.cursorSizeHint}
          style={getCursorHintStyles(
            targetBounds,
            screenBounds,
            areaColors,
            startCursorPosition,
            curCursorPosition
          )}
        >
          {entireCaptureBounds.width}x{entireCaptureBounds.height}
        </div>
      )}
    </>
  );
}

export default CaptureTargetingArea;
