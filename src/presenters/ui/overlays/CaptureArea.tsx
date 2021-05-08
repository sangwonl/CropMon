/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
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

import { isEmptyBounds, isCapturableBounds, emptyBounds } from '@utils/bounds';

import { SelectedBounds } from './types';

import styles from './CaptureArea.css';

interface PropTypes {
  active: boolean;
  selectedBounds?: SelectedBounds;
  onSelectionStart: () => void;
  onSelectionFinish: (bounds: SelectedBounds) => void;
  onSelectionCancel: () => void;
}

interface AreaSelectionCtx {
  started: boolean;
  selected: boolean;
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
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  curX: 0,
  curY: 0,
};

const calcSelectedBounds = (selCtx: AreaSelectionCtx): SelectedBounds => {
  if (!selCtx.started) {
    return emptyBounds();
  }

  const endX = selCtx.selected ? selCtx.endX : selCtx.curX;
  const endY = selCtx.selected ? selCtx.endY : selCtx.curY;
  return {
    x: Math.min(selCtx.startX, endX),
    y: Math.min(selCtx.startY, endY),
    width: Math.abs(endX - selCtx.startX),
    height: Math.abs(endY - selCtx.startY),
  };
};

const getAreaClasses = (selCtx: AreaSelectionCtx): string => {
  const bounds = calcSelectedBounds(selCtx);

  if (isEmptyBounds(bounds)) {
    return styles.areaHidden;
  }

  if (!isCapturableBounds(bounds)) {
    return classNames(styles.area, styles.areaUncapturable);
  }

  if (selCtx.selected) {
    return classNames(styles.area, styles.areaSelected);
  }

  return styles.area;
};

const getAreaLayout = (selCtx: AreaSelectionCtx): any => {
  const bounds = calcSelectedBounds(selCtx);

  return {
    left: bounds.x,
    top: bounds.y,
    width: bounds.width + 1,
    height: bounds.height + 1,
  };
};

const handleMouseDown = (
  onSelectionStart: () => void,
  onSelectionCancel: () => void,
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => (e: MouseEvent<HTMLDivElement>) => {
  if (selCtx.selected) {
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

const handleMouseUp = (
  onSelectionCancel: () => void,
  onSelectionFinish: (bounds: SelectedBounds) => void,
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => (e: MouseEvent<HTMLDivElement>) => {
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

  updatedSelCtx.selected = true;
  setSelCtx(updatedSelCtx);
  onSelectionFinish(bounds);
};

const handleMouseMove = (
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => (e: MouseEvent<HTMLDivElement>) => {
  setSelCtx({
    ...selCtx,
    curX: e.clientX,
    curY: e.clientY,
  });
};

export const CaptureArea: FC<PropTypes> = (props: PropTypes) => {
  const {
    active,
    selectedBounds,
    onSelectionStart: onStart,
    onSelectionFinish: onFinish,
    onSelectionCancel: onCancel,
  } = props;

  const [selCtx, setSelCtx] = useState<AreaSelectionCtx>(initialSelCtx);

  const mouseDownHandler = handleMouseDown(
    onStart,
    onCancel,
    selCtx,
    setSelCtx
  );
  const mouseUpHandler = handleMouseUp(onCancel, onFinish, selCtx, setSelCtx);
  const mouseMoveHandler = handleMouseMove(selCtx, setSelCtx);

  useEffect(() => {
    setSelCtx({ ...selCtx, selected: selectedBounds !== undefined });
  }, [selectedBounds]);

  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div
      className={classNames({
        [styles.wrapper]: true,
        [styles.crosshair]: !selCtx.selected,
      })}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
    >
      {active && (
        <div className={getAreaClasses(selCtx)} style={getAreaLayout(selCtx)} />
      )}
    </div>
  );
};

CaptureArea.defaultProps = {
  selectedBounds: undefined,
};
