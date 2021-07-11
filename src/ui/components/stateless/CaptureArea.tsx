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

import { IBounds } from '@core/entities/screen';
import { SPARE_PIXELS, isEmptyBounds, isCapturableBounds } from '@utils/bounds';

import styles from './CaptureArea.css';

interface PropTypes {
  active: boolean;
  isRecording: boolean;
  selectedBounds?: IBounds | undefined;
  onSelectionStart: () => void;
  onSelectionCancel: () => void;
  onSelectionFinish: (bounds: IBounds) => void;
  onHovering: () => void;
}

interface AreaSelectionCtx {
  started: boolean;
  selected: boolean;
  recording: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curX: number;
  curY: number;
}

const initialSelCtx: AreaSelectionCtx = {
  started: false,
  selected: false,
  recording: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  curX: 0,
  curY: 0,
};

const calcSelectedBounds = (selCtx: AreaSelectionCtx): IBounds => {
  const endX = selCtx.selected ? selCtx.endX : selCtx.curX;
  const endY = selCtx.selected ? selCtx.endY : selCtx.curY;
  return {
    x: Math.min(selCtx.startX, endX) - SPARE_PIXELS,
    y: Math.min(selCtx.startY, endY) - SPARE_PIXELS,
    width: Math.abs(endX - selCtx.startX) + 1,
    height: Math.abs(endY - selCtx.startY) + 1,
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
      startX: e.clientX,
      startY: e.clientY,
      curX: e.clientX,
      curY: e.clientY,
    });

    onSelectionStart();
  };

const handleMouseUp =
  (
    onSelectionCancel: () => void,
    onSelectionFinish: (bounds: IBounds) => void,
    selCtx: AreaSelectionCtx,
    setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
  ) =>
  (e: MouseEvent<HTMLDivElement>) => {
    if (selCtx.recording) {
      return;
    }

    const updatedSelCtx = {
      ...selCtx,
      endX: e.clientX,
      endY: e.clientY,
      curX: e.clientX,
      curY: e.clientY,
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
    onSelectionFinish(bounds);
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
      curX: e.clientX,
      curY: e.clientY,
    });
  };

export const CaptureArea: FC<PropTypes> = (props: PropTypes) => {
  const {
    active,
    isRecording,
    selectedBounds,
    onSelectionStart: onStart,
    onSelectionFinish: onFinish,
    onSelectionCancel: onCancel,
    onHovering,
  } = props;

  const [selCtx, setSelCtx] = useState<AreaSelectionCtx>(initialSelCtx);

  useEffect(() => {
    if (selectedBounds === undefined) {
      setSelCtx(initialSelCtx);
    } else {
      setSelCtx({
        ...selCtx,
        recording: isRecording,
        selected: selectedBounds !== undefined,
      });
    }
  }, [isRecording, selectedBounds]);

  const onMouseDown = handleMouseDown(onStart, onCancel, selCtx, setSelCtx);
  const onMouseUp = handleMouseUp(onCancel, onFinish, selCtx, setSelCtx);
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

CaptureArea.defaultProps = {
  selectedBounds: undefined,
};
