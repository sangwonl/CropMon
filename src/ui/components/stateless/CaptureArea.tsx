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
}

interface IAreaSelectionCtx {
  started: boolean;
  selected: boolean;
  recording: boolean;
  startPt: IPoint;
  endPt: IPoint;
  curPt: IPoint;
  curScreenPt: IPoint;
}

const initialSelCtx: IAreaSelectionCtx = {
  started: false,
  selected: false,
  recording: false,
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

const handleMouseDown = (
  e: MouseEvent<HTMLDivElement>,
  getCursorScreenPoint: () => IPoint,
  onSelectionStart: () => void,
  onSelectionCancel: () => void,
  selCtx: IAreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<IAreaSelectionCtx>>
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
  setSelCtx: Dispatch<SetStateAction<IAreaSelectionCtx>>
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
    x: Math.min(updatedSelCtx.curScreenPt.x, curScreenPt.x),
    y: Math.min(updatedSelCtx.curScreenPt.y, curScreenPt.y),
    width: Math.abs(curScreenPt.x - updatedSelCtx.curScreenPt.x) + 1,
    height: Math.abs(curScreenPt.y - updatedSelCtx.curScreenPt.y) + 1,
  });
};

const handleMouseMove = (
  e: MouseEvent<HTMLDivElement>,
  selCtx: IAreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<IAreaSelectionCtx>>
) => {
  if (selCtx.recording || !selCtx.started) {
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
  } = props;

  const [selCtx, setSelCtx] = useState<IAreaSelectionCtx>(initialSelCtx);

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
      e.preventDefault();
      e.stopPropagation();
      if (!isRecording && e.code === 'Escape') {
        setSelCtx(initialSelCtx);
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isRecording]);

  const calcBounds = calcSelectedBounds(selCtx);

  return (
    <div
      className={classNames({
        [styles.wrapper]: true,
        [styles.wrapperHack]: !isRecording,
        [styles.cursorSelecting]: !selCtx.selected,
      })}
      onMouseDown={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseDown(e, getCursorPt, onStart, onCancel, selCtx, setSelCtx)
      }
      onMouseUp={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseUp(e, getCursorPt, onCancel, onFinish, selCtx, setSelCtx)
      }
      onMouseMove={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseMove(e, selCtx, setSelCtx)
      }
    >
      {active && (
        <>
          <div
            className={getAreaClasses(isRecording, calcBounds)}
            style={getAreaLayout(calcBounds)}
          />
          <div
            className={classNames({
              [styles.cursorSizeHint]: !selCtx.selected,
            })}
            style={getCursorHintLayout(selCtx)}
          >
            {calcBounds.width}x{calcBounds.height}
          </div>
        </>
      )}
    </div>
  );
};
