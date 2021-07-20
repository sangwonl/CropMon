/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, {
  useState,
  MouseEvent,
  Dispatch,
  SetStateAction,
  FC,
  useEffect,
} from 'react';
import classNames from 'classnames';

import { IBounds, IPoint } from '@core/entities/screen';
import { SPARE_PIXELS, isEmptyBounds, isCapturableBounds } from '@utils/bounds';

import styles from './CaptureArea.css';

interface PropTypes {
  active: boolean;
  isRecording: boolean;
  boundsSelected: boolean;
  getCursorScreenPoint: () => IPoint;
  onSelectionStart: () => void;
  onSelectionCancel: () => void;
  onSelectionFinish: (bounds: IBounds) => void;
  onHovering: () => void;
}

interface AreaSelectionCtx {
  started: boolean;
  selected: boolean;
  recording: boolean;
  startPt: IPoint;
  endPt: IPoint;
  curPt: IPoint;
  screenPt: IPoint;
}

const initialSelCtx: AreaSelectionCtx = {
  started: false,
  selected: false,
  recording: false,
  startPt: { x: 0, y: 0 },
  endPt: { x: 0, y: 0 },
  curPt: { x: 0, y: 0 },
  screenPt: { x: 0, y: 0 },
};

const calcSelectedBounds = (selCtx: AreaSelectionCtx): IBounds => {
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
  recording: boolean,
  bounds: IBounds,
  selCtx: AreaSelectionCtx
): string => {
  if (isEmptyBounds(bounds)) {
    return styles.areaHidden;
  }

  if (!isCapturableBounds(bounds)) {
    return classNames(styles.area, styles.areaUncapturable);
  }

  if (recording) {
    return classNames(styles.area, styles.areaRecording);
  }

  if (selCtx.selected) {
    return classNames(styles.area, styles.areaSelected);
  }

  return classNames(styles.area, styles.areaSelecting);
};

const getAreaLayout = (bounds: IBounds): any => {
  return {
    left: bounds.x + SPARE_PIXELS,
    top: bounds.y + SPARE_PIXELS,
    width: bounds.width,
    height: bounds.height,
  };
};

const handleMouseDown =
  (
    getCursorScreenPoint: () => IPoint,
    onSelectionStart: () => void,
    onSelectionCancel: () => void,
    selCtx: AreaSelectionCtx,
    setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
  ) =>
  (e: MouseEvent<HTMLDivElement>) => {
    if (selCtx.recording) {
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
      screenPt: getCursorScreenPoint(),
    });

    onSelectionStart();
  };

const handleMouseUp =
  (
    getCursorScreenPoint: () => IPoint,
    onSelectionCancel: () => void,
    onSelectionFinish: (bounds: IBounds) => void,
    selCtx: AreaSelectionCtx,
    setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
  ) =>
  (e: MouseEvent<HTMLDivElement>) => {
    if (selCtx.recording) {
      return;
    }

    // if click after already area settled or right click while selecting
    if (selCtx.selected || e.button === 2) {
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
      x: Math.min(updatedSelCtx.screenPt.x, curScreenPt.x),
      y: Math.min(updatedSelCtx.screenPt.y, curScreenPt.y),
      width: Math.abs(curScreenPt.x - updatedSelCtx.screenPt.x),
      height: Math.abs(curScreenPt.y - updatedSelCtx.screenPt.y),
    });
  };

const handleMouseMove =
  (
    onHovering: () => void,
    selCtx: AreaSelectionCtx,
    setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
  ) =>
  (e: MouseEvent<HTMLDivElement>) => {
    if (selCtx.recording) {
      return;
    }

    if (!selCtx.started) {
      onHovering();
      return;
    }

    setSelCtx({
      ...selCtx,
      curPt: { x: e.clientX, y: e.clientY },
    });
  };

export const CaptureArea: FC<PropTypes> = (props: PropTypes) => {
  const {
    active,
    isRecording,
    boundsSelected,
    getCursorScreenPoint: getCursorPt,
    onSelectionStart: onStart,
    onSelectionFinish: onFinish,
    onSelectionCancel: onCancel,
    onHovering,
  } = props;

  const [selCtx, setSelCtx] = useState<AreaSelectionCtx>(initialSelCtx);

  useEffect(() => {
    if (!boundsSelected) {
      setSelCtx(initialSelCtx);
    } else {
      setSelCtx({
        ...selCtx,
        recording: isRecording,
        selected: boundsSelected,
      });
    }
  }, [isRecording, boundsSelected]);

  const onMouseDown = handleMouseDown(
    getCursorPt,
    onStart,
    onCancel,
    selCtx,
    setSelCtx
  );
  const onMouseUp = handleMouseUp(
    getCursorPt,
    onCancel,
    onFinish,
    selCtx,
    setSelCtx
  );
  const onMouseMove = handleMouseMove(onHovering, selCtx, setSelCtx);
  const calcBounds = calcSelectedBounds(selCtx);

  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div
      className={classNames({
        [styles.wrapper]: true,
        [styles.wrapperHack]: !isRecording,
        [styles.crosshair]: !selCtx.selected,
      })}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {active && (
        <div
          className={getAreaClasses(isRecording, calcBounds, selCtx)}
          style={getAreaLayout(calcBounds)}
        />
      )}
    </div>
  );
};
