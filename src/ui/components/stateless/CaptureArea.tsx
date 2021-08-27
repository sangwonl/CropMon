/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, {
  MouseEvent,
  Dispatch,
  SetStateAction,
  FC,
  useState,
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

const getAreaClasses = (recording: boolean, bounds: IBounds): string => {
  if (isEmptyBounds(bounds)) {
    return styles.areaHidden;
  }

  if (!isCapturableBounds(bounds)) {
    return classNames(styles.area, styles.areaUncapturable);
  }

  if (recording) {
    return classNames(styles.area, styles.areaRecording);
  }

  return classNames(styles.area, styles.areaSelecting);
};

const getAreaLayout = (bounds: IBounds): any => {
  return {
    left: bounds.x + SPARE_PIXELS - 1,
    top: bounds.y + SPARE_PIXELS - 1,
    width: bounds.width + 2,
    height: bounds.height + 2,
  };
};

const handleMouseDown = (
  e: MouseEvent<HTMLDivElement>,
  getCursorScreenPoint: () => IPoint,
  onSelectionStart: () => void,
  onSelectionCancel: () => void,
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => {
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

const handleMouseUp = (
  e: MouseEvent<HTMLDivElement>,
  getCursorScreenPoint: () => IPoint,
  onSelectionCancel: () => void,
  onSelectionFinish: (bounds: IBounds) => void,
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => {
  if (selCtx.recording) {
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
    x: Math.min(updatedSelCtx.screenPt.x, curScreenPt.x),
    y: Math.min(updatedSelCtx.screenPt.y, curScreenPt.y),
    width: Math.abs(curScreenPt.x - updatedSelCtx.screenPt.x) + 1,
    height: Math.abs(curScreenPt.y - updatedSelCtx.screenPt.y) + 1,
  });
};

const handleMouseMove = (
  e: MouseEvent<HTMLDivElement>,
  onHovering: () => void,
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => {
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setSelCtx(initialSelCtx);
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const calcBounds = calcSelectedBounds(selCtx);

  return (
    <div
      className={classNames({
        [styles.wrapper]: true,
        [styles.wrapperHack]: !isRecording,
        [styles.crosshair]: !selCtx.selected,
      })}
      onMouseDown={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseDown(e, getCursorPt, onStart, onCancel, selCtx, setSelCtx)
      }
      onMouseUp={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseUp(e, getCursorPt, onCancel, onFinish, selCtx, setSelCtx)
      }
      onMouseMove={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseMove(e, onHovering, selCtx, setSelCtx)
      }
    >
      {active && (
        <div
          className={getAreaClasses(isRecording, calcBounds)}
          style={getAreaLayout(calcBounds)}
        />
      )}
    </div>
  );
};
