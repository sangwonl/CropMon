/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, { useState, MouseEvent, Dispatch, SetStateAction } from 'react';
import { rgba } from 'polished';

import { isEmptySize, isCapturableSize } from '@utils/bounds';

import { SelectedBounds } from './types';

import styles from './CaptureArea.css';

interface PropTypes {
  active: boolean;
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
    return { x: 0, y: 0, width: 0, height: 0 };
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

const getSelectedAreaStyles = (selCtx: AreaSelectionCtx): any => {
  const bounds = calcSelectedBounds(selCtx);

  if (isEmptySize(bounds)) {
    return { display: 'none' };
  }

  let styles: any = {
    left: bounds.x,
    top: bounds.y,
    width: bounds.width + 1,
    height: bounds.height + 1,
  };

  if (!isCapturableSize(bounds)) {
    styles = {
      ...styles,
      backgroundColor: rgba(255, 10, 10, 0.1),
      boxShadow: 'inset 0 0 3px red',
    };
  }

  return styles;
};

const handleMouseDown = (
  onSelectionStart: () => void,
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => (e: MouseEvent<HTMLDivElement>) => {
  setSelCtx({
    ...selCtx,
    started: true,
    selected: false,
    startX: e.clientX,
    startY: e.clientY,
    curX: e.clientX,
    curY: e.clientY,
  });

  onSelectionStart();
};

const handleMouseUp = (
  onSelectionFinished: (bounds: SelectedBounds) => void,
  onSelectionCanceled: () => void,
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
  if (!isCapturableSize(bounds)) {
    setSelCtx(initialSelCtx);
    setTimeout(() => {
      onSelectionCanceled();
    }, 0);
    return;
  }

  updatedSelCtx.selected = true;
  setSelCtx(updatedSelCtx);
  onSelectionFinished(bounds);
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

export const CaptureArea = (props: PropTypes) => {
  const {
    active,
    onSelectionStart: onStart,
    onSelectionFinish: onFinish,
    onSelectionCancel: onCancel,
  } = props;

  const [selCtx, setSelCtx] = useState<AreaSelectionCtx>(initialSelCtx);

  const mouseDownHandler = handleMouseDown(onStart, selCtx, setSelCtx);
  const mouseUpHandler = handleMouseUp(onFinish, onCancel, selCtx, setSelCtx);
  const mouseMoveHandler = handleMouseMove(selCtx, setSelCtx);

  return (
    <div
      className={styles.wrapper}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
    >
      {active && (
        <div className={styles.area} style={getSelectedAreaStyles(selCtx)} />
      )}
    </div>
  );
};
