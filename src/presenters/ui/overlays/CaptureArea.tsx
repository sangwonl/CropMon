/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React from 'react';

import styles from './CaptureArea.css';

export interface AreaSelectionCtx {
  started: boolean;
  selected: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curX: number;
  curY: number;
}

interface PropTypes {
  ctx: AreaSelectionCtx;
}

export const CaptureArea = (props: PropTypes) => {
  const { ctx } = props;

  const endX = ctx.selected ? ctx.endX : ctx.curX;
  const endY = ctx.selected ? ctx.endY : ctx.curY;

  let bounds = { left: 0, top: 0, width: 0, height: 0 };
  if (ctx.started) {
    bounds = {
      left: Math.min(ctx.startX, endX),
      top: Math.min(ctx.startY, endY),
      width: Math.abs(endX - ctx.startX),
      height: Math.abs(endY - ctx.startY),
    };
  }

  const showOutlineOrHide = (): any => {
    if (bounds.width > 0 && bounds.height > 0) {
      return bounds;
    }
    return { display: 'none' };
  };

  return <div className={styles.area} style={showOutlineOrHide()} />;
};
