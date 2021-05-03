/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, { useState, MouseEvent, Dispatch, SetStateAction } from 'react';

import styles from './CaptureArea.css';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PropTypes {}

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

const handleMouseDown = (
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
};

const handleMouseUp = (
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => (e: MouseEvent<HTMLDivElement>) => {
  setSelCtx({
    ...selCtx,
    selected: true,
    endX: e.clientX,
    endY: e.clientY,
    curX: e.clientX,
    curY: e.clientY,
  });
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

const calcSelectionBounds = (selCtx: AreaSelectionCtx): any => {
  const endX = selCtx.selected ? selCtx.endX : selCtx.curX;
  const endY = selCtx.selected ? selCtx.endY : selCtx.curY;

  let bounds: any = { left: 0, top: 0, width: 0, height: 0 };
  if (selCtx.started) {
    bounds = {
      left: Math.min(selCtx.startX, endX),
      top: Math.min(selCtx.startY, endY),
      width: Math.abs(endX - selCtx.startX),
      height: Math.abs(endY - selCtx.startY),
    };
  }

  if (bounds.width === 0 || bounds.height === 0) {
    bounds = { ...bounds, display: 'none' };
  }

  return bounds;
};

export const CaptureArea = (props: PropTypes) => {
  const [selCtx, setSelCtx] = useState<AreaSelectionCtx>(initialSelCtx);

  const mouseDownHandler = handleMouseDown(selCtx, setSelCtx);
  const mouseUpHandler = handleMouseUp(selCtx, setSelCtx);
  const mouseMoveHandler = handleMouseMove(selCtx, setSelCtx);

  return (
    <div
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
    >
      <div className={styles.area} style={calcSelectionBounds(selCtx)} />
    </div>
  );
};
